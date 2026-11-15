import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { AbuseService } from '../abuse/abuse.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LinksService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private abuseService: AbuseService,
    private configService: ConfigService,
  ) {}

  async createLink(dto: CreateLinkDto, userId?: string) {
    // Validate target URL & safety
    const targetUrl = this.abuseService.validateTargetUrl(dto.targetUrl);

    // Slug generation or validation
    let slug: string;
    if (dto.customAlias) {
      const validatedAlias = this.abuseService.validateCustomAlias(dto.customAlias);
      if (!validatedAlias) {
        throw new BadRequestException('Invalid custom alias provided.');
      }

      // Check if alias already taken
      const existing = await this.prisma.link.findUnique({
        where: { slug: validatedAlias },
      });
      if (existing) {
        throw new ConflictException(`The alias '${validatedAlias}' is already in use.`);
      }
      slug = validatedAlias;
    } else {
      // Generate unique short slug
      let attempts = 0;
      let generated = nanoid(7);
      while (attempts < 5) {
        const collision = await this.prisma.link.findUnique({ where: { slug: generated } });
        if (!collision) break;
        generated = nanoid(8);
        attempts++;
      }
      slug = generated;
    }

    // Password hashing if protected
    let passwordHash: string | null = null;
    let isProtected = false;
    if (dto.password && dto.password.trim() !== '') {
      passwordHash = await bcrypt.hash(dto.password, 10);
      isProtected = true;
    }

    // Expiration date
    let expiresAt: Date | null = null;
    if (dto.expiresAt) {
      expiresAt = new Date(dto.expiresAt);
      if (isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
        throw new BadRequestException('Expiration date must be a valid future timestamp.');
      }
    }

    // Optional domain verification
    let domainId: string | null = null;
    if (dto.domainId && userId) {
      const domain = await this.prisma.domain.findFirst({
        where: { id: dto.domainId, userId },
      });
      if (!domain) {
        throw new BadRequestException('Custom domain not found or not owned by you.');
      }
      domainId = domain.id;
    }

    const redirectCode = dto.redirectCode || 307;

    const link = await this.prisma.link.create({
      data: {
        slug,
        targetUrl,
        description: dto.description || null,
        isActive: true,
        isProtected,
        passwordHash,
        expiresAt,
        redirectCode,
        domainId,
        userId: userId || null,
      },
      include: {
        domain: true,
      },
    });

    // Populate Redis/In-memory cache for fast redirect
    await this.cacheLinkData(link);

    return this.formatLinkResponse(link);
  }

  async getUserLinks(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      order?: 'asc' | 'desc';
    },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (query.search && query.search.trim() !== '') {
      const search = query.search.trim();
      where.OR = [
        { slug: { contains: search, mode: 'insensitive' } },
        { targetUrl: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.order === 'asc' ? 'asc' : 'desc';
    orderBy[sortField] = sortOrder;

    const [links, total] = await Promise.all([
      this.prisma.link.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { domain: true },
      }),
      this.prisma.link.count({ where }),
    ]);

    return {
      data: links.map((link) => this.formatLinkResponse(link)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLinkById(id: string, userId?: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: { domain: true },
    });

    if (!link) {
      throw new NotFoundException('Link not found.');
    }

    if (link.userId && link.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this link.');
    }

    return this.formatLinkResponse(link);
  }

  async updateLink(id: string, dto: UpdateLinkDto, userId: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
      include: { domain: true },
    });

    if (!link) {
      throw new NotFoundException('Link not found.');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this link.');
    }

    const data: any = {};

    if (dto.targetUrl !== undefined) {
      data.targetUrl = this.abuseService.validateTargetUrl(dto.targetUrl);
    }

    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    if (dto.redirectCode !== undefined) {
      data.redirectCode = dto.redirectCode;
    }

    if (dto.expiresAt !== undefined) {
      if (dto.expiresAt === null) {
        data.expiresAt = null;
      } else {
        const exp = new Date(dto.expiresAt);
        if (isNaN(exp.getTime())) {
          throw new BadRequestException('Invalid expiration date format.');
        }
        data.expiresAt = exp;
      }
    }

    if (dto.password !== undefined) {
      if (dto.password === '' || dto.password === null) {
        data.isProtected = false;
        data.passwordHash = null;
      } else {
        data.isProtected = true;
        data.passwordHash = await bcrypt.hash(dto.password, 10);
      }
    }

    const updated = await this.prisma.link.update({
      where: { id },
      data,
      include: { domain: true },
    });

    // Update / invalidate cache
    await this.cacheLinkData(updated);

    return this.formatLinkResponse(updated);
  }

  async deleteLink(id: string, userId: string) {
    const link = await this.prisma.link.findUnique({
      where: { id },
    });

    if (!link) {
      throw new NotFoundException('Link not found.');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this link.');
    }

    await this.prisma.link.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cache.del(`link:${link.slug}`);

    return { message: 'Link deleted successfully.', id };
  }

  private async cacheLinkData(link: any) {
    const cacheKey = `link:${link.slug}`;
    const payload = JSON.stringify({
      id: link.id,
      slug: link.slug,
      targetUrl: link.targetUrl,
      isActive: link.isActive,
      isProtected: link.isProtected,
      passwordHash: link.passwordHash,
      expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
      redirectCode: link.redirectCode,
      domain: link.domain ? link.domain.domain : null,
    });
    // Cache for 1 hour
    await this.cache.set(cacheKey, payload, 3600);
  }

  private formatLinkResponse(link: any) {
    const appBaseUrl = this.configService.get<string>('appBaseUrl', 'http://localhost:4000');
    const domainPrefix = link.domain ? `http://${link.domain.domain}` : `${appBaseUrl}/r`;
    const shortUrl = `${domainPrefix}/${link.slug}`;

    return {
      id: link.id,
      slug: link.slug,
      shortUrl,
      targetUrl: link.targetUrl,
      description: link.description,
      isActive: link.isActive,
      isProtected: link.isProtected,
      expiresAt: link.expiresAt,
      redirectCode: link.redirectCode,
      clickCount: link.clickCount,
      domain: link.domain
        ? { id: link.domain.id, domain: link.domain.domain, isVerified: link.domain.isVerified }
        : null,
      userId: link.userId,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    };
  }
}

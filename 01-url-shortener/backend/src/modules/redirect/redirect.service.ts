import { Injectable, NotFoundException, GoneException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { AnalyticsService } from '../analytics/analytics.service';
import * as bcrypt from 'bcryptjs';

export interface ResolveResult {
  targetUrl: string;
  redirectCode: number;
  isProtected: boolean;
  requiresPassword: boolean;
  linkId: string;
}

@Injectable()
export class RedirectService {
  private readonly logger = new Logger(RedirectService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private analyticsService: AnalyticsService,
  ) {}

  async resolveSlug(
    slug: string,
    meta: {
      ip?: string;
      userAgent?: string;
      referrer?: string;
      countryHeader?: string;
    },
  ): Promise<ResolveResult> {
    // Check cache first
    let linkData: any = null;
    const cached = await this.cache.get(`link:${slug}`);
    if (cached) {
      try {
        linkData = JSON.parse(cached);
      } catch {}
    }

    // Cache miss: query database
    if (!linkData) {
      const link = await this.prisma.link.findUnique({
        where: { slug },
      });

      if (!link) {
        throw new NotFoundException(`Short link '${slug}' was not found.`);
      }

      linkData = {
        id: link.id,
        slug: link.slug,
        targetUrl: link.targetUrl,
        isActive: link.isActive,
        isProtected: link.isProtected,
        passwordHash: link.passwordHash,
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
        redirectCode: link.redirectCode,
      };

      // Populate cache
      await this.cache.set(`link:${slug}`, JSON.stringify(linkData), 3600);
    }

    // Check if active
    if (!linkData.isActive) {
      throw new NotFoundException(`This link has been deactivated by its owner.`);
    }

    // Check expiration
    if (linkData.expiresAt) {
      const exp = new Date(linkData.expiresAt);
      if (Date.now() > exp.getTime()) {
        throw new GoneException(`This short link expired on ${exp.toUTCString()}.`);
      }
    }

    // Check password protection
    if (linkData.isProtected && linkData.passwordHash) {
      return {
        targetUrl: '',
        redirectCode: linkData.redirectCode,
        isProtected: true,
        requiresPassword: true,
        linkId: linkData.id,
      };
    }

    // Track click asynchronously without blocking redirect
    this.analyticsService.recordClick(linkData.id, meta).catch((err) => {
      this.logger.error(`Failed to record click for ${linkData.id}: ${err.message}`);
    });

    return {
      targetUrl: linkData.targetUrl,
      redirectCode: linkData.redirectCode,
      isProtected: false,
      requiresPassword: false,
      linkId: linkData.id,
    };
  }

  async verifyPasswordAndResolve(
    slug: string,
    password: string,
    meta: {
      ip?: string;
      userAgent?: string;
      referrer?: string;
      countryHeader?: string;
    },
  ) {
    if (!password) {
      throw new BadRequestException('Password is required.');
    }

    const link = await this.prisma.link.findUnique({
      where: { slug },
    });

    if (!link || !link.isActive) {
      throw new NotFoundException('Short link not found or inactive.');
    }

    if (link.expiresAt && Date.now() > link.expiresAt.getTime()) {
      throw new GoneException('This short link has expired.');
    }

    if (!link.isProtected || !link.passwordHash) {
      return { targetUrl: link.targetUrl };
    }

    const isValid = await bcrypt.compare(password, link.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Incorrect password for this protected link.');
    }

    // Track click
    this.analyticsService.recordClick(link.id, meta).catch((err) => {
      this.logger.error(`Failed to record click on password verification for ${link.id}: ${err.message}`);
    });

    return { targetUrl: link.targetUrl };
  }
}

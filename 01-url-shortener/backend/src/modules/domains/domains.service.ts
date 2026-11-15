import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';

@Injectable()
export class DomainsService {
  constructor(private prisma: PrismaService) {}

  async createDomain(dto: CreateDomainDto, userId: string) {
    const cleanDomain = dto.domain.toLowerCase().trim();

    const existing = await this.prisma.domain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      throw new ConflictException(`The domain '${cleanDomain}' is already registered.`);
    }

    const domain = await this.prisma.domain.create({
      data: {
        domain: cleanDomain,
        fallbackUrl: dto.fallbackUrl || null,
        isVerified: true, // For demo/development purposes auto-verified
        userId,
      },
    });

    return domain;
  }

  async getUserDomains(userId: string) {
    return this.prisma.domain.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { links: true },
        },
      },
    });
  }

  async deleteDomain(id: string, userId: string) {
    const domain = await this.prisma.domain.findUnique({
      where: { id },
    });

    if (!domain) {
      throw new NotFoundException('Domain not found.');
    }

    if (domain.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this domain.');
    }

    await this.prisma.domain.delete({
      where: { id },
    });

    return { message: 'Domain deleted successfully.', id };
  }
}

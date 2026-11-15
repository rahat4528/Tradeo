import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, ownerId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        organizationId,
        ownerId,
        name: dto.name.trim(),
        domain: dto.domain?.trim() || null,
        industry: dto.industry?.trim() || 'Technology',
        phone: dto.phone?.trim() || null,
        address: dto.address?.trim() || null,
        annualRevenue: dto.annualRevenue !== undefined ? dto.annualRevenue : 0,
        tier: dto.tier || 'MID_MARKET',
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(organizationId: string, query?: { search?: string; industry?: string }) {
    const where: any = { organizationId };

    if (query?.industry) {
      where.industry = query.industry;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { domain: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        owner: { select: { id: true, name: true } },
        _count: {
          select: { contacts: true, deals: true },
        },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        contacts: true,
        deals: {
          include: { owner: { select: { id: true, name: true } } },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!company) throw new NotFoundException('Company not found.');
    if (company.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    return company;
  }

  async update(id: string, organizationId: string, dto: Partial<CreateCompanyDto>) {
    await this.findOne(id, organizationId);

    return this.prisma.company.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.domain !== undefined ? { domain: dto.domain?.trim() || null } : {}),
        ...(dto.industry ? { industry: dto.industry.trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone?.trim() || null } : {}),
        ...(dto.address !== undefined ? { address: dto.address?.trim() || null } : {}),
        ...(dto.annualRevenue !== undefined ? { annualRevenue: dto.annualRevenue } : {}),
        ...(dto.tier ? { tier: dto.tier } : {}),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.company.delete({ where: { id } });
  }
}

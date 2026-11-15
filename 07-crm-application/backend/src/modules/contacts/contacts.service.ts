import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, ownerId: string, dto: CreateContactDto) {
    if (dto.companyId) {
      const company = await this.prisma.company.findUnique({ where: { id: dto.companyId } });
      if (!company || company.organizationId !== organizationId) {
        throw new NotFoundException('Associated company not found.');
      }
    }

    return this.prisma.contact.create({
      data: {
        organizationId,
        ownerId,
        companyId: dto.companyId || null,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone?.trim() || null,
        title: dto.title?.trim() || null,
        leadSource: dto.leadSource || 'Inbound Web',
      },
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(organizationId: string, query?: { search?: string; companyId?: string }) {
    const where: any = { organizationId };

    if (query?.companyId) {
      where.companyId = query.companyId;
    }

    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.contact.findMany({
      where,
      orderBy: { lastName: 'asc' },
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        owner: { select: { id: true, name: true, email: true } },
        deals: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!contact) throw new NotFoundException('Contact not found.');
    if (contact.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    return contact;
  }

  async update(id: string, organizationId: string, dto: Partial<CreateContactDto>) {
    await this.findOne(id, organizationId);

    return this.prisma.contact.update({
      where: { id },
      data: {
        ...(dto.firstName ? { firstName: dto.firstName.trim() } : {}),
        ...(dto.lastName ? { lastName: dto.lastName.trim() } : {}),
        ...(dto.email ? { email: dto.email.toLowerCase().trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone?.trim() || null } : {}),
        ...(dto.title !== undefined ? { title: dto.title?.trim() || null } : {}),
        ...(dto.companyId !== undefined ? { companyId: dto.companyId || null } : {}),
        ...(dto.leadSource ? { leadSource: dto.leadSource } : {}),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.contact.delete({ where: { id } });
  }
}

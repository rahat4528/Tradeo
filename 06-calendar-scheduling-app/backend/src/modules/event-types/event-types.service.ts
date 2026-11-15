import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

@Injectable()
export class EventTypesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventTypeDto) {
    const existing = await this.prisma.eventType.findUnique({
      where: {
        userId_slug: {
          userId,
          slug: dto.slug.toLowerCase().trim(),
        },
      },
    });

    if (existing) {
      throw new ConflictException(`An event type with slug '${dto.slug}' already exists.`);
    }

    return this.prisma.eventType.create({
      data: {
        userId,
        title: dto.title.trim(),
        slug: dto.slug.toLowerCase().trim(),
        description: dto.description?.trim() || null,
        durationMinutes: dto.durationMinutes,
        locationType: dto.locationType,
        locationValue: dto.locationValue?.trim() || null,
        bufferBefore: dto.bufferBefore ?? 0,
        bufferAfter: dto.bufferAfter ?? 0,
        minNoticeHours: dto.minNoticeHours ?? 2,
        maxDaysNotice: dto.maxDaysNotice ?? 60,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.eventType.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const eventType = await this.prisma.eventType.findUnique({
      where: { id },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    if (!eventType) throw new NotFoundException('Event type not found.');
    if (eventType.userId !== userId) throw new ForbiddenException('Access denied.');

    return eventType;
  }

  async update(id: string, userId: string, dto: UpdateEventTypeDto) {
    await this.findOne(id, userId);

    if (dto.slug) {
      const existing = await this.prisma.eventType.findUnique({
        where: {
          userId_slug: {
            userId,
            slug: dto.slug.toLowerCase().trim(),
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`An event type with slug '${dto.slug}' already exists.`);
      }
    }

    return this.prisma.eventType.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title.trim() } : {}),
        ...(dto.slug ? { slug: dto.slug.toLowerCase().trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
        ...(dto.durationMinutes ? { durationMinutes: dto.durationMinutes } : {}),
        ...(dto.locationType ? { locationType: dto.locationType } : {}),
        ...(dto.locationValue !== undefined ? { locationValue: dto.locationValue?.trim() || null } : {}),
        ...(dto.bufferBefore !== undefined ? { bufferBefore: dto.bufferBefore } : {}),
        ...(dto.bufferAfter !== undefined ? { bufferAfter: dto.bufferAfter } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.eventType.delete({ where: { id } });
  }
}

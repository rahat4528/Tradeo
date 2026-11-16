import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';
import { LogLevel } from '@prisma/client';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLogDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service ${dto.serviceId} not found`);
    }

    return this.prisma.logEntry.create({
      data: {
        serviceId: dto.serviceId,
        level: dto.level || LogLevel.INFO,
        message: dto.message,
      },
      include: { service: true },
    });
  }

  async findAll(userId: string, filters?: { serviceId?: string; level?: LogLevel; search?: string; limit?: number }) {
    const where: any = {
      service: { userId },
    };

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters?.level) {
      where.level = filters.level;
    }

    if (filters?.search) {
      where.message = { contains: filters.search, mode: 'insensitive' };
    }

    return this.prisma.logEntry.findMany({
      where,
      include: { service: true },
      orderBy: { timestamp: 'desc' },
      take: filters?.limit || 100,
    });
  }
}

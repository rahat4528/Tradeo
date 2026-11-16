import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { Environment, ServiceStatus } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        userId,
        name: dto.name,
        url: dto.url,
        environment: dto.environment || Environment.PRODUCTION,
        intervalSeconds: dto.intervalSeconds || 30,
        status: ServiceStatus.HEALTHY,
        uptimePercent: 99.99,
      },
    });
  }

  async findAll(userId: string, environment?: Environment) {
    return this.prisma.service.findMany({
      where: {
        userId,
        ...(environment && { environment }),
      },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            incidents: { where: { status: { not: 'RESOLVED' } } },
            alerts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, userId },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 24,
        },
        alerts: true,
        incidents: {
          orderBy: { triggeredAt: 'desc' },
          take: 10,
        },
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }

    return service;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.service.delete({ where: { id } });
  }
}

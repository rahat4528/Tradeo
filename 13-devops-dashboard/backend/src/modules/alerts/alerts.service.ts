import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlertDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service ${dto.serviceId} not found`);
    }

    return this.prisma.alertRule.create({
      data: {
        serviceId: dto.serviceId,
        metricType: dto.metricType,
        operator: dto.operator,
        threshold: dto.threshold,
        severity: dto.severity,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.alertRule.findMany({
      where: { service: { userId } },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const alert = await this.prisma.alertRule.findUnique({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alert ${id} not found`);
    }
    return this.prisma.alertRule.delete({ where: { id } });
  }
}

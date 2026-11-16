import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentStatus, ServiceStatus } from '@prisma/client';

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, status?: IncidentStatus) {
    return this.prisma.incident.findMany({
      where: {
        service: { userId },
        ...(status && { status }),
      },
      include: {
        service: true,
        alertRule: true,
      },
      orderBy: { triggeredAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        service: true,
        alertRule: true,
      },
    });

    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    return incident;
  }

  async update(id: string, userName: string, dto: UpdateIncidentDto) {
    const incident = await this.findOne(id);

    const isResolving = dto.status === IncidentStatus.RESOLVED;
    const isAcknowledging = dto.status === IncidentStatus.ACKNOWLEDGED;

    const updated = await this.prisma.incident.update({
      where: { id },
      data: {
        status: dto.status,
        resolutionNotes: dto.resolutionNotes || incident.resolutionNotes,
        ...(isAcknowledging && {
          acknowledgedAt: new Date(),
          acknowledgedBy: userName,
        }),
        ...(isResolving && {
          resolvedAt: new Date(),
          resolvedBy: userName,
        }),
      },
      include: { service: true },
    });

    // If resolving, check if any other triggered incidents exist on this service; if none, restore service status to HEALTHY
    if (isResolving) {
      const remainingIncidents = await this.prisma.incident.count({
        where: {
          serviceId: incident.serviceId,
          status: { not: IncidentStatus.RESOLVED },
          id: { not: id },
        },
      });

      if (remainingIncidents === 0) {
        await this.prisma.service.update({
          where: { id: incident.serviceId },
          data: { status: ServiceStatus.HEALTHY },
        });
      }
    }

    return updated;
  }
}

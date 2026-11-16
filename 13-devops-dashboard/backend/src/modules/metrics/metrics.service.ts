import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { IncidentStatus, ServiceStatus } from '@prisma/client';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(serviceId: string, dto: CreateMetricDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        alerts: { where: { isEnabled: true } },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    const snapshot = await this.prisma.metricSnapshot.create({
      data: {
        serviceId,
        cpuPercent: dto.cpuPercent,
        memoryPercent: dto.memoryPercent,
        requestRate: dto.requestRate,
        latencyMs: dto.latencyMs,
        errorRate: dto.errorRate,
      },
    });

    // Auto-evaluate alert rules
    for (const rule of service.alerts) {
      let value = 0;
      if (rule.metricType === 'CPU') value = dto.cpuPercent;
      else if (rule.metricType === 'MEMORY') value = dto.memoryPercent;
      else if (rule.metricType === 'LATENCY') value = dto.latencyMs;
      else if (rule.metricType === 'ERROR_RATE') value = dto.errorRate;

      let triggered = false;
      if (rule.operator === 'GT' && value > rule.threshold) triggered = true;
      if (rule.operator === 'LT' && value < rule.threshold) triggered = true;
      if (rule.operator === 'EQ' && value === rule.threshold) triggered = true;

      if (triggered) {
        // Trigger an incident
        await this.prisma.incident.create({
          data: {
            serviceId,
            alertRuleId: rule.id,
            title: `Alert triggered: ${rule.metricType} ${rule.operator} ${rule.threshold} (Actual: ${value.toFixed(1)})`,
            severity: rule.severity,
            status: IncidentStatus.TRIGGERED,
          },
        });

        // Set service to DEGRADED or DOWN based on severity
        await this.prisma.service.update({
          where: { id: serviceId },
          data: {
            status: rule.severity === 'CRITICAL' ? ServiceStatus.DOWN : ServiceStatus.DEGRADED,
          },
        });
      }
    }

    return snapshot;
  }

  async getServiceMetrics(serviceId: string, limit = 24) {
    const snapshots = await this.prisma.metricSnapshot.findMany({
      where: { serviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return snapshots.reverse();
  }

  async getSummary(userId: string) {
    const services = await this.prisma.service.findMany({
      where: { userId },
      include: {
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    let totalCpu = 0;
    let totalMemory = 0;
    let totalRps = 0;
    let totalLatency = 0;
    let countedServices = 0;

    for (const s of services) {
      if (s.metrics.length > 0) {
        const m = s.metrics[0];
        totalCpu += m.cpuPercent;
        totalMemory += m.memoryPercent;
        totalRps += m.requestRate;
        totalLatency += m.latencyMs;
        countedServices++;
      }
    }

    const healthyCount = services.filter((s) => s.status === 'HEALTHY').length;
    const degradedCount = services.filter((s) => s.status === 'DEGRADED').length;
    const downCount = services.filter((s) => s.status === 'DOWN').length;

    return {
      totalServices: services.length,
      healthyCount,
      degradedCount,
      downCount,
      avgCpuPercent: countedServices > 0 ? Number((totalCpu / countedServices).toFixed(1)) : 0,
      avgMemoryPercent: countedServices > 0 ? Number((totalMemory / countedServices).toFixed(1)) : 0,
      totalRequestRate: Number(totalRps.toFixed(0)),
      avgLatencyMs: countedServices > 0 ? Number((totalLatency / countedServices).toFixed(1)) : 0,
    };
  }
}

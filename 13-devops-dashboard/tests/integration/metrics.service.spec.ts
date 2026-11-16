import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from '../../backend/src/modules/metrics/metrics.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';
import { IncidentStatus, ServiceStatus } from '@prisma/client';

describe('Integration: MetricsService', () => {
  let service: MetricsService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('should ingest metric snapshot and trigger incident when threshold exceeded', async () => {
    const mockService = {
      id: 'srv-1',
      alerts: [
        {
          id: 'rule-1',
          metricType: 'CPU',
          operator: 'GT',
          threshold: 80.0,
          severity: 'CRITICAL',
          isEnabled: true,
        },
      ],
    };

    mockPrisma.service.findUnique.mockResolvedValue(mockService);
    mockPrisma.metricSnapshot.create.mockResolvedValue({
      id: 'snap-1',
      serviceId: 'srv-1',
      cpuPercent: 92.5,
      memoryPercent: 60.0,
      requestRate: 450,
      latencyMs: 120,
      errorRate: 0.1,
    });
    mockPrisma.incident.create.mockResolvedValue({ id: 'inc-1' });
    mockPrisma.service.update.mockResolvedValue({ id: 'srv-1' });

    const result = await service.create('srv-1', {
      cpuPercent: 92.5,
      memoryPercent: 60.0,
      requestRate: 450,
      latencyMs: 120,
      errorRate: 0.1,
    });

    expect(result.id).toBe('snap-1');
    expect(mockPrisma.incident.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          serviceId: 'srv-1',
          severity: 'CRITICAL',
          status: IncidentStatus.TRIGGERED,
        }),
      }),
    );
    expect(mockPrisma.service.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'srv-1' },
        data: { status: ServiceStatus.DOWN },
      }),
    );
  });

  it('should throw NotFoundException if service does not exist on metric ingest', async () => {
    mockPrisma.service.findUnique.mockResolvedValue(null);

    await expect(
      service.create('non-existent', {
        cpuPercent: 10,
        memoryPercent: 20,
        requestRate: 10,
        latencyMs: 50,
        errorRate: 0,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should compute cluster summary metrics', async () => {
    const mockServices = [
      {
        id: 'srv-1',
        status: ServiceStatus.HEALTHY,
        metrics: [{ cpuPercent: 30, memoryPercent: 40, requestRate: 200, latencyMs: 25 }],
      },
      {
        id: 'srv-2',
        status: ServiceStatus.DEGRADED,
        metrics: [{ cpuPercent: 70, memoryPercent: 80, requestRate: 300, latencyMs: 75 }],
      },
    ];

    mockPrisma.service.findMany.mockResolvedValue(mockServices);

    const summary = await service.getSummary('usr-1');
    expect(summary.totalServices).toBe(2);
    expect(summary.healthyCount).toBe(1);
    expect(summary.degradedCount).toBe(1);
    expect(summary.avgCpuPercent).toBe(50);
    expect(summary.avgMemoryPercent).toBe(60);
    expect(summary.totalRequestRate).toBe(500);
    expect(summary.avgLatencyMs).toBe(50);
  });
});

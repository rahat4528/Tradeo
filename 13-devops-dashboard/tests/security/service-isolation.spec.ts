import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from '../../backend/src/modules/services/services.service';
import { MetricsService } from '../../backend/src/modules/metrics/metrics.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';

describe('Security: Service and Tenant Isolation', () => {
  let servicesService: ServicesService;
  let metricsService: MetricsService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        MetricsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    servicesService = module.get<ServicesService>(ServicesService);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should prevent User A from retrieving services owned by User B', async () => {
    // When User A queries for service B with service.findOne('srv-B', 'usr-A'),
    // the query must filter by userId: 'usr-A'
    mockPrisma.service.findFirst.mockImplementation(({ where }: any) => {
      if (where.id === 'srv-B' && where.userId === 'usr-A') {
        return Promise.resolve(null);
      }
      return Promise.resolve({ id: 'srv-B', userId: 'usr-B', name: 'User B Database' });
    });

    await expect(servicesService.findOne('srv-B', 'usr-A')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should prevent User A from deleting services owned by User B', async () => {
    mockPrisma.service.findFirst.mockResolvedValue(null);

    await expect(servicesService.remove('srv-B', 'usr-A')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.service.delete).not.toHaveBeenCalled();
  });

  it('should enforce user scope on cluster summary metrics aggregation', async () => {
    mockPrisma.service.findMany.mockResolvedValue([]);

    await metricsService.getSummary('usr-A');

    expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'usr-A' },
      }),
    );
  });
});

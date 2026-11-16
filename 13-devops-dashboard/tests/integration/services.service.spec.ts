import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from '../../backend/src/modules/services/services.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';
import { Environment, ServiceStatus } from '@prisma/client';

describe('Integration: ServicesService', () => {
  let service: ServicesService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should register a new monitored service', async () => {
    const mockCreated = {
      id: 'srv-1',
      userId: 'usr-1',
      name: 'Authentication Gateway',
      url: 'https://auth.internal.tradeo.io/health',
      environment: Environment.PRODUCTION,
      intervalSeconds: 30,
      status: ServiceStatus.HEALTHY,
      uptimePercent: 99.99,
    };
    mockPrisma.service.create.mockResolvedValue(mockCreated);

    const result = await service.create('usr-1', {
      name: 'Authentication Gateway',
      url: 'https://auth.internal.tradeo.io/health',
      environment: Environment.PRODUCTION,
    });

    expect(result.id).toBe('srv-1');
    expect(result.name).toBe('Authentication Gateway');
    expect(mockPrisma.service.create).toHaveBeenCalled();
  });

  it('should filter registered services by environment', async () => {
    const mockList = [
      { id: 'srv-1', name: 'Auth Gateway', environment: Environment.PRODUCTION },
    ];
    mockPrisma.service.findMany.mockResolvedValue(mockList);

    const result = await service.findAll('usr-1', Environment.PRODUCTION);
    expect(result).toHaveLength(1);
    expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'usr-1',
          environment: Environment.PRODUCTION,
        }),
      }),
    );
  });

  it('should return service detail by id', async () => {
    const mockService = {
      id: 'srv-1',
      userId: 'usr-1',
      name: 'API Service',
      metrics: [],
      alerts: [],
      incidents: [],
      deployments: [],
    };
    mockPrisma.service.findFirst.mockResolvedValue(mockService);

    const result = await service.findOne('srv-1', 'usr-1');
    expect(result.name).toBe('API Service');
  });

  it('should throw NotFoundException if service is not found', async () => {
    mockPrisma.service.findFirst.mockResolvedValue(null);

    await expect(service.findOne('invalid-id', 'usr-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete an existing service', async () => {
    mockPrisma.service.findFirst.mockResolvedValue({ id: 'srv-1', userId: 'usr-1' });
    mockPrisma.service.delete.mockResolvedValue({ id: 'srv-1' });

    const result = await service.remove('srv-1', 'usr-1');
    expect(result.id).toBe('srv-1');
    expect(mockPrisma.service.delete).toHaveBeenCalledWith({ where: { id: 'srv-1' } });
  });
});

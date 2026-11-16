import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from '../../backend/src/modules/projects/projects.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('Project Multi-Tenancy & Security Isolation Tests', () => {
  let service: ProjectsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should prevent user from accessing a project owned by another user', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null); // Owner mismatch query returns null

    await expect(service.findOne('proj-secret', 'user-attacker')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 'proj-secret', ownerId: 'user-attacker' },
      include: expect.any(Object),
    });
  });

  it('should prevent unauthorized deletion of projects across tenant boundary', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null);

    await expect(service.remove('proj-secret', 'user-attacker')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.project.delete).not.toHaveBeenCalled();
  });

  it('should reject creating duplicate project keys across workspace', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'existing-proj',
      key: 'TRAD',
      name: 'Existing Project',
    });

    await expect(
      service.create('user-1', {
        name: 'New Project',
        key: 'TRAD',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should return only projects owned by the requesting authenticated user', async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      { id: 'proj-1', name: 'User 1 Project', ownerId: 'user-1' },
    ]);

    const result = await service.findAll('user-1');
    expect(result.length).toBe(1);
    expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
      where: { ownerId: 'user-1' },
      include: expect.any(Object),
      orderBy: { createdAt: 'desc' },
    });
  });
});

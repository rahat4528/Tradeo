import { Test, TestingModule } from '@nestjs/testing';
import { SprintsService } from '../../backend/src/modules/sprints/sprints.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { ConflictException } from '@nestjs/common';
import { SprintStatus, StateCategory } from '@prisma/client';

describe('SprintsService Lifecycle Integration', () => {
  let service: SprintsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SprintsService>(SprintsService);
  });

  it('should create sprint with FUTURE status', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ id: 'proj-1', name: 'Project 1' });
    mockPrisma.sprint.create.mockResolvedValue({
      id: 'sprint-1',
      projectId: 'proj-1',
      name: 'Sprint 1',
      status: SprintStatus.FUTURE,
      _count: { issues: 0 },
    });

    const sprint = await service.create('proj-1', { name: 'Sprint 1' });
    expect(sprint.status).toBe(SprintStatus.FUTURE);
    expect(mockPrisma.sprint.create).toHaveBeenCalled();
  });

  it('should start a sprint when no active sprint exists', async () => {
    mockPrisma.sprint.findUnique.mockResolvedValue({
      id: 'sprint-1',
      projectId: 'proj-1',
      name: 'Sprint 1',
      status: SprintStatus.FUTURE,
      issues: [],
    });
    mockPrisma.sprint.findFirst.mockResolvedValue(null); // No currently active sprint
    mockPrisma.sprint.update.mockResolvedValue({
      id: 'sprint-1',
      status: SprintStatus.ACTIVE,
    });

    const active = await service.start('sprint-1');
    expect(active.status).toBe(SprintStatus.ACTIVE);
  });

  it('should throw ConflictException if another sprint is already ACTIVE', async () => {
    mockPrisma.sprint.findUnique.mockResolvedValue({
      id: 'sprint-2',
      projectId: 'proj-1',
      name: 'Sprint 2',
      status: SprintStatus.FUTURE,
      issues: [],
    });
    mockPrisma.sprint.findFirst.mockResolvedValue({
      id: 'sprint-1',
      name: 'Sprint 1',
      status: SprintStatus.ACTIVE,
    });

    await expect(service.start('sprint-2')).rejects.toThrow(ConflictException);
  });

  it('should complete sprint and rollover incomplete issues to backlog', async () => {
    mockPrisma.sprint.findUnique.mockResolvedValue({
      id: 'sprint-1',
      projectId: 'proj-1',
      name: 'Sprint 1',
      status: SprintStatus.ACTIVE,
      issues: [],
    });

    // Incomplete issues
    mockPrisma.issue.findMany.mockResolvedValue([
      { id: 'issue-1', sprintId: 'sprint-1', status: { category: StateCategory.TODO } },
      { id: 'issue-2', sprintId: 'sprint-1', status: { category: StateCategory.IN_PROGRESS } },
    ]);

    mockPrisma.issue.updateMany.mockResolvedValue({ count: 2 });
    mockPrisma.sprint.update.mockResolvedValue({
      id: 'sprint-1',
      status: SprintStatus.CLOSED,
    });

    const closed = await service.complete('sprint-1');
    expect(closed.status).toBe(SprintStatus.CLOSED);
    expect(mockPrisma.issue.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['issue-1', 'issue-2'] } },
      data: { sprintId: null },
    });
  });
});

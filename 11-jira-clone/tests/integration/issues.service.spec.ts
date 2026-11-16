import { Test, TestingModule } from '@nestjs/testing';
import { IssuesService } from '../../backend/src/modules/issues/issues.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { IssuePriority, IssueType } from '@prisma/client';

describe('IssuesService Integration', () => {
  let service: IssuesService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<IssuesService>(IssuesService);
  });

  it('should create issue with auto-generated key and default status', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: 'proj-1',
      key: 'TRAD',
      workflowStates: [
        { id: 'state-backlog', name: 'Backlog', isDefault: true },
        { id: 'state-todo', name: 'To Do', isDefault: false },
      ],
    });

    mockPrisma.project.update.mockResolvedValue({
      id: 'proj-1',
      issueCounter: 15,
    });

    mockPrisma.issue.create.mockResolvedValue({
      id: 'issue-1',
      key: 'TRAD-15',
      projectId: 'proj-1',
      title: 'Fix authentication cookie flag',
      type: IssueType.BUG,
      priority: IssuePriority.HIGH,
      statusId: 'state-backlog',
      status: { id: 'state-backlog', name: 'Backlog' },
    });

    const result = await service.create('proj-1', 'user-1', {
      title: 'Fix authentication cookie flag',
      type: IssueType.BUG,
      priority: IssuePriority.HIGH,
    });

    expect(result.key).toBe('TRAD-15');
    expect(result.title).toBe('Fix authentication cookie flag');
    expect(mockPrisma.project.update).toHaveBeenCalledWith({
      where: { id: 'proj-1' },
      data: { issueCounter: { increment: 1 } },
    });
  });

  it('should query backlog issues when isBacklog flag is passed', async () => {
    mockPrisma.issue.findMany.mockResolvedValue([
      { id: 'issue-1', key: 'TRAD-1', sprintId: null },
      { id: 'issue-2', key: 'TRAD-2', sprintId: null },
    ]);

    const issues = await service.findAll('proj-1', { isBacklog: true });
    expect(issues.length).toBe(2);
    expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: 'proj-1',
          sprintId: null,
        }),
      }),
    );
  });

  it('should update issue status and story points', async () => {
    mockPrisma.issue.findFirst.mockResolvedValue({
      id: 'issue-1',
      key: 'TRAD-1',
      statusId: 'state-todo',
      storyPoints: 3,
    });

    mockPrisma.issue.update.mockResolvedValue({
      id: 'issue-1',
      key: 'TRAD-1',
      statusId: 'state-inprogress',
      storyPoints: 5,
    });

    const updated = await service.update('issue-1', {
      statusId: 'state-inprogress',
      storyPoints: 5,
    });

    expect(updated.statusId).toBe('state-inprogress');
    expect(updated.storyPoints).toBe(5);
  });
});

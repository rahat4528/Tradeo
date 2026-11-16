import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '../../backend/src/modules/projects/projects.controller';
import { ProjectsService } from '../../backend/src/modules/projects/projects.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('Projects API Controller & Service Tests', () => {
  let controller: ProjectsController;
  let service: ProjectsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should create a project and return project with workflow states', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);
    mockPrisma.project.create.mockResolvedValue({
      id: 'proj-1',
      name: 'Mobile App',
      key: 'MOB',
      ownerId: 'user-1',
    });
    mockPrisma.workflowState.create.mockResolvedValue({ id: 'state-1' });
    mockPrisma.project.findFirst.mockResolvedValue({
      id: 'proj-1',
      name: 'Mobile App',
      key: 'MOB',
      workflowStates: [{ id: 'state-1', name: 'Backlog' }],
      sprints: [],
      _count: { issues: 0 },
    });

    const result = await controller.create({ id: 'user-1' }, {
      name: 'Mobile App',
      key: 'MOB',
    });

    expect(result.id).toBe('proj-1');
    expect(result.key).toBe('MOB');
    expect(result.workflowStates.length).toBe(1);
  });

  it('should list all projects for authenticated user', async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      { id: 'proj-1', name: 'Mobile App', key: 'MOB' },
      { id: 'proj-2', name: 'Backend Core', key: 'ENG' },
    ]);

    const result = await controller.findAll({ id: 'user-1' });
    expect(result.length).toBe(2);
    expect(result[0].key).toBe('MOB');
  });

  it('should retrieve project details by id', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({
      id: 'proj-1',
      name: 'Mobile App',
      key: 'MOB',
    });

    const result = await controller.findOne('proj-1', { id: 'user-1' });
    expect(result.id).toBe('proj-1');
  });
});

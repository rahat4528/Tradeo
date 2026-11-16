import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from '../../backend/src/modules/boards/boards.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('BoardsService Integration', () => {
  let service: BoardsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('should create board and seed default columns and swimlanes', async () => {
    mockPrisma.board.create.mockResolvedValue({
      id: 'board-1',
      title: 'DevOps Pipeline',
      ownerId: 'user-1',
    });
    mockPrisma.swimlane.create.mockResolvedValue({ id: 'swim-1' });
    mockPrisma.column.create.mockResolvedValue({ id: 'col-1' });
    mockPrisma.board.findFirst.mockResolvedValue({
      id: 'board-1',
      title: 'DevOps Pipeline',
      columns: [],
      swimlanes: [],
      cards: [],
    });

    const result = await service.create('user-1', { title: 'DevOps Pipeline' });
    expect(result.id).toBe('board-1');
    expect(mockPrisma.swimlane.create).toHaveBeenCalledTimes(2);
    expect(mockPrisma.column.create).toHaveBeenCalledTimes(4);
  });

  it('should calculate days in column and mark breached columns on retrieval', async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    mockPrisma.board.findFirst.mockResolvedValue({
      id: 'board-1',
      title: 'DevOps Pipeline',
      columns: [
        {
          id: 'col-1',
          title: 'In Progress',
          wipLimit: 2,
          _count: { cards: 3 }, // 3 cards > 2 limit -> breached!
        },
      ],
      swimlanes: [],
      cards: [
        {
          id: 'card-1',
          title: 'Fix issue',
          columnId: 'col-1',
          enteredColumnAt: twoDaysAgo,
          createdAt: twoDaysAgo,
        },
      ],
    });

    const result = await service.findOne('board-1', 'user-1');
    expect(result.columns[0].isBreached).toBe(true);
    expect(result.cards[0].daysInColumn).toBe(2);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from '../../backend/src/modules/analytics/analytics.controller';
import { AnalyticsService } from '../../backend/src/modules/analytics/analytics.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('Analytics API Controller & Service Tests', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should return board flow analytics with lead/cycle times and CFD', async () => {
    const past = new Date('2026-11-01T00:00:00Z');
    const middle = new Date('2026-11-03T00:00:00Z');
    const completed = new Date('2026-11-05T00:00:00Z');

    mockPrisma.board.findUnique.mockResolvedValue({
      id: 'board-1',
      columns: [
        { id: 'col-1', title: 'Ready', order: 0, isTerminal: false, wipLimit: 5, _count: { cards: 1 } },
        { id: 'col-2', title: 'Doing', order: 1, isTerminal: false, wipLimit: 2, _count: { cards: 1 } },
        { id: 'col-3', title: 'Done', order: 2, isTerminal: true, wipLimit: null, _count: { cards: 1 } },
      ],
      cards: [
        {
          id: 'card-1',
          columnId: 'col-3',
          createdAt: past,
          startedAt: middle,
          completedAt: completed,
          isBlocked: false,
        },
        {
          id: 'card-2',
          columnId: 'col-2',
          createdAt: past,
          startedAt: middle,
          completedAt: null,
          isBlocked: true,
        },
        {
          id: 'card-3',
          columnId: 'col-1',
          createdAt: past,
          startedAt: null,
          completedAt: null,
          isBlocked: false,
        },
      ],
    });

    const result = await controller.getBoardAnalytics('board-1');

    expect(result.totalCards).toBe(3);
    expect(result.completedCardsCount).toBe(1);
    expect(result.activeWipCount).toBe(1); // card in col-2
    expect(result.blockedCount).toBe(1);
    expect(result.averageLeadTimeDays).toBe(4.0); // 4 days (Nov 1 to Nov 5)
    expect(result.averageCycleTimeDays).toBe(2.0); // 2 days (Nov 3 to Nov 5)
    expect(result.cfd.length).toBe(3);
  });
});

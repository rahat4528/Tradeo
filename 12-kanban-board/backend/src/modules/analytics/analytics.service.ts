import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoardAnalytics(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { cards: true } },
          },
        },
        cards: true,
      },
    });

    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }

    const completedCards = board.cards.filter((c) => c.completedAt !== null);

    // Calculate lead times (createdAt -> completedAt)
    let totalLeadTimeDays = 0;
    for (const card of completedCards) {
      const start = new Date(card.createdAt).getTime();
      const end = new Date(card.completedAt).getTime();
      totalLeadTimeDays += Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
    }
    const averageLeadTimeDays =
      completedCards.length > 0
        ? Number((totalLeadTimeDays / completedCards.length).toFixed(1))
        : 0;

    // Calculate cycle times (startedAt -> completedAt)
    const cardsWithCycle = completedCards.filter((c) => c.startedAt !== null);
    let totalCycleTimeDays = 0;
    for (const card of cardsWithCycle) {
      const start = new Date(card.startedAt).getTime();
      const end = new Date(card.completedAt).getTime();
      totalCycleTimeDays += Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
    }
    const averageCycleTimeDays =
      cardsWithCycle.length > 0
        ? Number((totalCycleTimeDays / cardsWithCycle.length).toFixed(1))
        : 0;

    // Active WIP count (in non-terminal columns)
    const inProgressColumns = board.columns.filter((col) => !col.isTerminal && col.order > 0);
    const inProgressColumnIds = new Set(inProgressColumns.map((col) => col.id));
    const activeWipCount = board.cards.filter((c) => inProgressColumnIds.has(c.columnId)).length;

    // Blocked cards
    const blockedCount = board.cards.filter((c) => c.isBlocked).length;

    // Cumulative Flow distribution
    const cfd = board.columns.map((col) => ({
      columnId: col.id,
      title: col.title,
      cardCount: col._count.cards,
      wipLimit: col.wipLimit,
      isTerminal: col.isTerminal,
    }));

    return {
      totalCards: board.cards.length,
      completedCardsCount: completedCards.length,
      activeWipCount,
      blockedCount,
      averageLeadTimeDays,
      averageCycleTimeDays,
      cfd,
    };
  }
}

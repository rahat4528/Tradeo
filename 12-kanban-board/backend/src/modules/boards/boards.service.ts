import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBoardDto) {
    const board = await this.prisma.board.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: userId,
      },
    });

    // Default swimlanes
    await this.prisma.swimlane.create({
      data: { boardId: board.id, title: 'Expedite', order: 0 },
    });
    await this.prisma.swimlane.create({
      data: { boardId: board.id, title: 'Standard Flow', order: 1 },
    });

    // Default columns
    const columns = [
      { title: 'Backlog / Ready', order: 0, wipLimit: 10, isTerminal: false },
      { title: 'In Development', order: 1, wipLimit: 3, isTerminal: false },
      { title: 'Code Review & QA', order: 2, wipLimit: 2, isTerminal: false },
      { title: 'Shipped to Prod', order: 3, wipLimit: null, isTerminal: true },
    ];

    for (const col of columns) {
      await this.prisma.column.create({
        data: {
          boardId: board.id,
          title: col.title,
          order: col.order,
          wipLimit: col.wipLimit,
          isTerminal: col.isTerminal,
        },
      });
    }

    return this.findOne(board.id, userId);
  }

  async findAll(userId: string) {
    return this.prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { cards: true, columns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.prisma.board.findFirst({
      where: { id, ownerId: userId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { cards: true } },
          },
        },
        swimlanes: {
          orderBy: { order: 'asc' },
        },
        cards: {
          include: {
            column: true,
            swimlane: true,
            assignee: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    // Enhance cards with aging metrics
    const now = Date.now();
    const enrichedCards = board.cards.map((card) => {
      const enteredAt = new Date(card.enteredColumnAt).getTime();
      const createdAt = new Date(card.createdAt).getTime();
      const daysInColumn = Math.max(0, Math.floor((now - enteredAt) / (1000 * 60 * 60 * 24)));
      const totalAgeDays = Math.max(0, Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)));

      return {
        ...card,
        daysInColumn,
        totalAgeDays,
      };
    });

    // Check column WIP limits
    const enrichedColumns = board.columns.map((col) => {
      const cardCount = col._count.cards;
      const isBreached = col.wipLimit !== null && cardCount > col.wipLimit;
      return {
        ...col,
        cardCount,
        isBreached,
      };
    });

    return {
      ...board,
      columns: enrichedColumns,
      cards: enrichedCards,
    };
  }

  async update(id: string, userId: string, dto: UpdateBoardDto) {
    await this.findOne(id, userId);
    return this.prisma.board.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.board.delete({
      where: { id },
    });
  }
}

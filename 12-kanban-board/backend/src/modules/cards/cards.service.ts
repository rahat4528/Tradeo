import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BlockCardDto } from './dto/block-card.dto';
import { Priority } from '@prisma/client';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(boardId: string, dto: CreateCardDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
    });
    if (!column) {
      throw new NotFoundException(`Column ${dto.columnId} not found`);
    }

    return this.prisma.card.create({
      data: {
        boardId,
        columnId: dto.columnId,
        swimlaneId: dto.swimlaneId || null,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || Priority.MEDIUM,
        size: dto.size || 'M',
        assigneeId: dto.assigneeId || null,
        position: Date.now(),
        enteredColumnAt: new Date(),
        startedAt: column.order > 0 ? new Date() : null,
      },
      include: {
        column: true,
        swimlane: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: {
        column: true,
        swimlane: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(`Card ${id} not found`);
    }

    const now = Date.now();
    const enteredAt = new Date(card.enteredColumnAt).getTime();
    const createdAt = new Date(card.createdAt).getTime();
    const daysInColumn = Math.max(0, Math.floor((now - enteredAt) / (1000 * 60 * 60 * 24)));
    const totalAgeDays = Math.max(0, Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)));

    return {
      ...card,
      daysInColumn,
      totalAgeDays,
    };
  }

  async update(id: string, dto: UpdateCardDto) {
    const existing = await this.findOne(id);

    let enteredColumnAt = existing.enteredColumnAt;
    let startedAt = existing.startedAt;
    let completedAt = existing.completedAt;

    if (dto.columnId && dto.columnId !== existing.columnId) {
      const targetColumn = await this.prisma.column.findUnique({
        where: { id: dto.columnId },
      });
      if (!targetColumn) {
        throw new NotFoundException(`Column ${dto.columnId} not found`);
      }

      enteredColumnAt = new Date();

      if (!startedAt && targetColumn.order > 0) {
        startedAt = new Date();
      }

      if (targetColumn.isTerminal) {
        completedAt = new Date();
      } else {
        completedAt = null;
      }
    }

    return this.prisma.card.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.columnId !== undefined && { columnId: dto.columnId }),
        ...(dto.swimlaneId !== undefined && { swimlaneId: dto.swimlaneId }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.size !== undefined && { size: dto.size }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        enteredColumnAt,
        startedAt,
        completedAt,
      },
      include: {
        column: true,
        swimlane: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  async block(id: string, dto: BlockCardDto) {
    await this.findOne(id);
    return this.prisma.card.update({
      where: { id },
      data: {
        isBlocked: dto.isBlocked,
        blockReason: dto.isBlocked ? dto.blockReason || 'Blocked by external dependency' : null,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.card.delete({ where: { id } });
  }
}

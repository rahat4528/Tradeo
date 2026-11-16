import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCardDto, UpdateCardDto, MoveCardDto } from './dto/card.dto';
import { BoardGateway } from '../gateway/board.gateway';

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private gateway: BoardGateway,
  ) {}

  async createCard(listId: string, dto: CreateCardDto, userId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    });
    if (!list) throw new NotFoundException('List not found');

    let position = dto.position;
    if (position === undefined) {
      const lastCard = await this.prisma.card.findFirst({
        where: { listId },
        orderBy: { position: 'desc' },
      });
      position = lastCard ? lastCard.position + 1000.0 : 1000.0;
    }

    const card = await this.prisma.card.create({
      data: {
        title: dto.title,
        description: dto.description,
        position,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        labels: (dto.labels || []) as any,
        listId,
      },
      include: {
        checklists: {
          include: { items: true },
        },
        comments: {
          include: { author: { select: { id: true, name: true, email: true } } },
        },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    await this.prisma.activity.create({
      data: {
        action: 'CREATED_CARD',
        details: { cardTitle: card.title, listTitle: list.title },
        cardId: card.id,
        boardId: list.boardId,
        userId,
      },
    });

    this.gateway.notifyCardCreated(list.boardId, card);

    return card;
  }

  async getCard(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: {
        list: { include: { board: true } },
        checklists: {
          include: { items: { orderBy: { position: 'asc' } } },
        },
        comments: {
          include: { author: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        activities: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  async updateCard(id: string, dto: UpdateCardDto, userId: string) {
    const existing = await this.prisma.card.findUnique({
      where: { id },
      include: { list: true },
    });
    if (!existing) throw new NotFoundException('Card not found');

    const updated = await this.prisma.card.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isCompleted !== undefined ? { isCompleted: dto.isCompleted } : {}),
        ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
        ...(dto.coverColor !== undefined ? { coverColor: dto.coverColor } : {}),
        ...(dto.labels !== undefined ? { labels: dto.labels as any } : {}),
      },
      include: {
        checklists: { include: { items: true } },
        comments: { include: { author: { select: { id: true, name: true } } } },
        members: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    this.gateway.notifyCardUpdated(existing.list.boardId, updated);

    return updated;
  }

  async moveCard(id: string, dto: MoveCardDto, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { list: true },
    });
    if (!card) throw new NotFoundException('Card not found');

    const sourceListId = card.listId;
    const targetList = await this.prisma.list.findUnique({
      where: { id: dto.targetListId },
    });
    if (!targetList) throw new NotFoundException('Target list not found');

    const updated = await this.prisma.card.update({
      where: { id },
      data: {
        listId: dto.targetListId,
        position: dto.newPosition,
      },
      include: {
        checklists: { include: { items: true } },
        comments: { include: { author: { select: { id: true, name: true } } } },
        members: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (sourceListId !== dto.targetListId) {
      await this.prisma.activity.create({
        data: {
          action: 'MOVED_CARD',
          details: {
            cardTitle: card.title,
            from: card.list.title,
            to: targetList.title,
          },
          cardId: card.id,
          boardId: targetList.boardId,
          userId,
        },
      });
    }

    this.gateway.notifyCardMoved(targetList.boardId, {
      cardId: card.id,
      sourceListId,
      targetListId: dto.targetListId,
      newPosition: dto.newPosition,
      card: updated,
    });

    return updated;
  }

  async deleteCard(id: string) {
    const card = await this.prisma.card.findUnique({ where: { id } });
    if (!card) throw new NotFoundException('Card not found');

    return this.prisma.card.delete({ where: { id } });
  }

  // Checklists
  async addChecklist(cardId: string, title: string) {
    await this.getCard(cardId);
    return this.prisma.checklist.create({
      data: {
        title,
        cardId,
      },
      include: {
        items: true,
      },
    });
  }

  async addChecklistItem(checklistId: string, title: string) {
    const lastItem = await this.prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: 'desc' },
    });
    const position = lastItem ? lastItem.position + 100.0 : 100.0;

    return this.prisma.checklistItem.create({
      data: {
        title,
        position,
        checklistId,
      },
    });
  }

  async toggleChecklistItem(itemId: string, isCompleted: boolean) {
    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted },
    });
  }

  async deleteChecklistItem(itemId: string) {
    return this.prisma.checklistItem.delete({
      where: { id: itemId },
    });
  }

  // Comments
  async addComment(cardId: string, content: string, authorId: string) {
    const card = await this.getCard(cardId);
    const comment = await this.prisma.comment.create({
      data: {
        content,
        cardId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.activity.create({
      data: {
        action: 'COMMENTED_ON_CARD',
        details: { cardTitle: card.title, content },
        cardId,
        boardId: card.list.boardId,
        userId: authorId,
      },
    });

    return comment;
  }
}

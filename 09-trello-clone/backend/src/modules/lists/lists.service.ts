import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateListDto, UpdateListDto } from './dto/list.dto';
import { BoardGateway } from '../gateway/board.gateway';

@Injectable()
export class ListsService {
  constructor(
    private prisma: PrismaService,
    private gateway: BoardGateway,
  ) {}

  async createList(boardId: string, dto: CreateListDto, userId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundException('Board not found');

    let position = dto.position;
    if (position === undefined) {
      const lastList = await this.prisma.list.findFirst({
        where: { boardId },
        orderBy: { position: 'desc' },
      });
      position = lastList ? lastList.position + 1000.0 : 1000.0;
    }

    const list = await this.prisma.list.create({
      data: {
        title: dto.title,
        position,
        boardId,
      },
      include: {
        cards: true,
      },
    });

    this.gateway.notifyListCreated(boardId, list);

    return list;
  }

  async updateList(id: string, dto: UpdateListDto) {
    const existing = await this.prisma.list.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('List not found');

    return this.prisma.list.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
      },
    });
  }

  async deleteList(id: string) {
    const existing = await this.prisma.list.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('List not found');

    return this.prisma.list.delete({
      where: { id },
    });
  }
}

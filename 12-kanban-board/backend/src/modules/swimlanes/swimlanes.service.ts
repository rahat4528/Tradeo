import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';

@Injectable()
export class SwimlanesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(boardId: string, dto: CreateSwimlaneDto) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }

    const order =
      dto.order ??
      (await this.prisma.swimlane.count({ where: { boardId } }));

    return this.prisma.swimlane.create({
      data: {
        boardId,
        title: dto.title,
        order,
      },
    });
  }

  async update(id: string, title: string) {
    const swimlane = await this.prisma.swimlane.findUnique({ where: { id } });
    if (!swimlane) {
      throw new NotFoundException(`Swimlane ${id} not found`);
    }

    return this.prisma.swimlane.update({
      where: { id },
      data: { title },
    });
  }

  async remove(id: string) {
    const swimlane = await this.prisma.swimlane.findUnique({ where: { id } });
    if (!swimlane) {
      throw new NotFoundException(`Swimlane ${id} not found`);
    }

    return this.prisma.swimlane.delete({ where: { id } });
  }
}

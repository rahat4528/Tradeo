import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(boardId: string, dto: CreateColumnDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }

    const order =
      dto.order ??
      (await this.prisma.column.count({ where: { boardId } }));

    return this.prisma.column.create({
      data: {
        boardId,
        title: dto.title,
        wipLimit: dto.wipLimit,
        policy: dto.policy,
        isTerminal: dto.isTerminal ?? false,
        order,
      },
    });
  }

  async update(id: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({ where: { id } });
    if (!column) {
      throw new NotFoundException(`Column ${id} not found`);
    }

    return this.prisma.column.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.wipLimit !== undefined && { wipLimit: dto.wipLimit }),
        ...(dto.policy !== undefined && { policy: dto.policy }),
        ...(dto.isTerminal !== undefined && { isTerminal: dto.isTerminal }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async remove(id: string) {
    const column = await this.prisma.column.findUnique({ where: { id } });
    if (!column) {
      throw new NotFoundException(`Column ${id} not found`);
    }

    return this.prisma.column.delete({ where: { id } });
  }
}

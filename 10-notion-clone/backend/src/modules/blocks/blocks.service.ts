import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBlockDto, UpdateBlockDto, ReorderBlockDto } from './dto/block.dto';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async createBlock(pageId: string, dto: CreateBlockDto) {
    const page = await this.prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');

    let position = dto.position;
    if (position === undefined) {
      const lastBlock = await this.prisma.block.findFirst({
        where: { pageId },
        orderBy: { position: 'desc' },
      });
      position = lastBlock ? lastBlock.position + 1000.0 : 1000.0;
    }

    return this.prisma.block.create({
      data: {
        type: dto.type,
        content: dto.content || '',
        position,
        properties: dto.properties || {},
        pageId,
      },
    });
  }

  async updateBlock(blockId: string, dto: UpdateBlockDto) {
    const existing = await this.prisma.block.findUnique({ where: { id: blockId } });
    if (!existing) throw new NotFoundException('Block not found');

    return this.prisma.block.update({
      where: { id: blockId },
      data: {
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.properties !== undefined ? { properties: dto.properties } : {}),
      },
    });
  }

  async reorderBlock(blockId: string, dto: ReorderBlockDto) {
    const existing = await this.prisma.block.findUnique({ where: { id: blockId } });
    if (!existing) throw new NotFoundException('Block not found');

    return this.prisma.block.update({
      where: { id: blockId },
      data: {
        position: dto.newPosition,
      },
    });
  }

  async deleteBlock(blockId: string) {
    const existing = await this.prisma.block.findUnique({ where: { id: blockId } });
    if (!existing) throw new NotFoundException('Block not found');

    return this.prisma.block.delete({
      where: { id: blockId },
    });
  }
}

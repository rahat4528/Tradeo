import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto, UpdateBlockDto, ReorderBlockDto } from './dto/block.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private service: BlocksService) {}

  @Post('page/:pageId')
  create(@Param('pageId') pageId: string, @Body() dto: CreateBlockDto) {
    return this.service.createBlock(pageId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.service.updateBlock(id, dto);
  }

  @Post(':id/reorder')
  reorder(@Param('id') id: string, @Body() dto: ReorderBlockDto) {
    return this.service.reorderBlock(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteBlock(id);
  }
}

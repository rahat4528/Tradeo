import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { BlockCardDto } from './dto/block-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('boards/:boardId/cards')
  create(@Param('boardId') boardId: string, @Body() dto: CreateCardDto) {
    return this.cardsService.create(boardId, dto);
  }

  @Get('cards/:id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch('cards/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto);
  }

  @Patch('cards/:id/block')
  block(@Param('id') id: string, @Body() dto: BlockCardDto) {
    return this.cardsService.block(id, dto);
  }

  @Delete('cards/:id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }
}

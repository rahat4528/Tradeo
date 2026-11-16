import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto, MoveCardDto } from './dto/card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private service: CardsService) {}

  @Post('list/:listId')
  create(
    @Param('listId') listId: string,
    @Body() dto: CreateCardDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createCard(listId, dto, user.userId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getCard(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateCard(id, dto, user.userId);
  }

  @Post(':id/move')
  move(
    @Param('id') id: string,
    @Body() dto: MoveCardDto,
    @CurrentUser() user: any,
  ) {
    return this.service.moveCard(id, dto, user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteCard(id);
  }

  // Checklists
  @Post(':id/checklists')
  addChecklist(@Param('id') id: string, @Body('title') title: string) {
    return this.service.addChecklist(id, title);
  }

  @Post('checklists/:checklistId/items')
  addChecklistItem(
    @Param('checklistId') checklistId: string,
    @Body('title') title: string,
  ) {
    return this.service.addChecklistItem(checklistId, title);
  }

  @Put('checklists/items/:itemId')
  toggleChecklistItem(
    @Param('itemId') itemId: string,
    @Body('isCompleted') isCompleted: boolean,
  ) {
    return this.service.toggleChecklistItem(itemId, isCompleted);
  }

  @Delete('checklists/items/:itemId')
  deleteChecklistItem(@Param('itemId') itemId: string) {
    return this.service.deleteChecklistItem(itemId);
  }

  // Comments
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: any,
  ) {
    return this.service.addComment(id, content, user.userId);
  }
}

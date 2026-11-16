import { Controller, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto, UpdateListDto } from './dto/list.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private service: ListsService) {}

  @Post('board/:boardId')
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateListDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createList(boardId, dto, user.userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListDto) {
    return this.service.updateList(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteList(id);
  }
}

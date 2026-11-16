import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MemberRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private service: BoardsService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.service.listBoards(user.userId, user.workspaceId);
  }

  @Post()
  create(@Body() dto: CreateBoardDto, @CurrentUser() user: any) {
    return this.service.createBoard(dto, user.userId, user.workspaceId);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getBoard(id, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateBoard(id, dto, user.userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.deleteBoard(id, user.userId);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body('email') email: string,
    @Body('role') role: MemberRole,
    @CurrentUser() user: any,
  ) {
    return this.service.addMember(id, email, role, user.userId);
  }
}

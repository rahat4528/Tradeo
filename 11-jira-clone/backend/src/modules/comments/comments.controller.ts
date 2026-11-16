import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('issues/:issueId/comments')
  create(
    @Param('issueId') issueId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(issueId, user.id, dto);
  }

  @Get('issues/:issueId/comments')
  findAll(@Param('issueId') issueId: string) {
    return this.commentsService.findAll(issueId);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commentsService.remove(id, user.id);
  }
}

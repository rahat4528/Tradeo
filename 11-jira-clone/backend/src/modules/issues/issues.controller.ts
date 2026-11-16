import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IssuePriority, IssueType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller()
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post('projects/:projectId/issues')
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateIssueDto,
  ) {
    return this.issuesService.create(projectId, user.id, dto);
  }

  @Get('projects/:projectId/issues')
  findAll(
    @Param('projectId') projectId: string,
    @Query('sprintId') sprintId?: string,
    @Query('backlog') backlog?: string,
    @Query('type') type?: IssueType,
    @Query('priority') priority?: IssuePriority,
    @Query('statusId') statusId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('search') search?: string,
  ) {
    return this.issuesService.findAll(projectId, {
      sprintId,
      isBacklog: backlog === 'true',
      type,
      priority,
      statusId,
      assigneeId,
      search,
    });
  }

  @Get('issues/:id')
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch('issues/:id')
  update(@Param('id') id: string, @Body() dto: UpdateIssueDto) {
    return this.issuesService.update(id, dto);
  }

  @Delete('issues/:id')
  remove(@Param('id') id: string) {
    return this.issuesService.remove(id);
  }
}

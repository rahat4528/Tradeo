import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Activities, Notes, Calls & Tasks')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Log a note, call, meeting, or email interaction' })
  async createActivity(@Req() req: any, @Body() dto: CreateActivityDto) {
    return this.activitiesService.createActivity(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get chronological activity history for deal or company' })
  async getActivities(@Req() req: any, @Query('dealId') dealId?: string, @Query('companyId') companyId?: string) {
    return this.activitiesService.getActivities(req.user.organizationId, { dealId, companyId });
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Create a follow-up task reminder linked to a deal' })
  async createTask(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.activitiesService.createTask(req.user.organizationId, req.user.id, dto);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'List tasks and reminders' })
  async getTasks(@Req() req: any) {
    return this.activitiesService.getTasks(req.user.organizationId);
  }

  @Patch('tasks/:id/complete')
  @ApiOperation({ summary: 'Toggle task completion status' })
  async toggleTask(@Req() req: any, @Param('id') id: string) {
    return this.activitiesService.toggleTaskCompletion(id, req.user.organizationId);
  }
}

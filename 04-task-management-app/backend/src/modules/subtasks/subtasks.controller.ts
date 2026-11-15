import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubtasksService } from './subtasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Subtasks')
@Controller('subtasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubtasksController {
  constructor(private subtasksService: SubtasksService) {}

  @Post(':taskId')
  @ApiOperation({ summary: 'Add a new subtask to a task' })
  async createSubtask(
    @Param('taskId') taskId: string,
    @Req() req: any,
    @Body('title') title: string,
  ) {
    return this.subtasksService.createSubtask(taskId, req.user.id, title);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle subtask completion state' })
  async toggleSubtask(@Param('id') id: string, @Req() req: any) {
    return this.subtasksService.toggleSubtask(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subtask' })
  async deleteSubtask(@Param('id') id: string, @Req() req: any) {
    return this.subtasksService.deleteSubtask(id, req.user.id);
  }
}

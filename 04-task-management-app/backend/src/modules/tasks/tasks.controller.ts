import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task with optional subtasks and recurrence' })
  async createTask(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with filtering by date, status, priority, or category' })
  async getTasks(@Req() req: any, @Query() query: QueryTasksDto) {
    return this.tasksService.getTasks(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed task with subtask checklist and reminders' })
  async getTaskById(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.getTaskById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task properties, status, or recurrence schedule' })
  async updateTask(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task and its subtasks' })
  async deleteTask(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.deleteTask(id, req.user.id);
  }
}

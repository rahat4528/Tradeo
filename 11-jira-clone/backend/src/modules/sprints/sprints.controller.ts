import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post('projects/:projectId/sprints')
  create(@Param('projectId') projectId: string, @Body() dto: CreateSprintDto) {
    return this.sprintsService.create(projectId, dto);
  }

  @Get('projects/:projectId/sprints')
  findAll(@Param('projectId') projectId: string) {
    return this.sprintsService.findAll(projectId);
  }

  @Get('sprints/:id')
  findOne(@Param('id') id: string) {
    return this.sprintsService.findOne(id);
  }

  @Post('sprints/:id/start')
  start(@Param('id') id: string) {
    return this.sprintsService.start(id);
  }

  @Post('sprints/:id/complete')
  complete(@Param('id') id: string) {
    return this.sprintsService.complete(id);
  }

  @Delete('sprints/:id')
  remove(@Param('id') id: string) {
    return this.sprintsService.remove(id);
  }
}

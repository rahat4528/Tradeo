import { Controller, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SwimlanesService } from './swimlanes.service';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class SwimlanesController {
  constructor(private readonly swimlanesService: SwimlanesService) {}

  @Post('boards/:boardId/swimlanes')
  create(@Param('boardId') boardId: string, @Body() dto: CreateSwimlaneDto) {
    return this.swimlanesService.create(boardId, dto);
  }

  @Patch('swimlanes/:id')
  update(@Param('id') id: string, @Body('title') title: string) {
    return this.swimlanesService.update(id, title);
  }

  @Delete('swimlanes/:id')
  remove(@Param('id') id: string) {
    return this.swimlanesService.remove(id);
  }
}

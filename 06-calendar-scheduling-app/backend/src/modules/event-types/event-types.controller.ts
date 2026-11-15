import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Event Types Management')
@Controller('event-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventTypesController {
  constructor(private readonly eventTypesService: EventTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bookable event type template' })
  async create(@Req() req: any, @Body() dto: CreateEventTypeDto) {
    return this.eventTypesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all event types created by host' })
  async findAll(@Req() req: any) {
    return this.eventTypesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of specific event type' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.eventTypesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event type durations, buffers, and parameters' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event type' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.eventTypesService.remove(id, req.user.id);
  }
}

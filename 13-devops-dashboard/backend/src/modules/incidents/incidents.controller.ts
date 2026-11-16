import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IncidentStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: IncidentStatus) {
    return this.incidentsService.findAll(user.id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(id, user.name || 'Engineer', dto);
  }
}

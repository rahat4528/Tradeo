import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { SetScheduleDto } from './dto/set-schedule.dto';
import { CreateOverrideDto } from './dto/create-override.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Availability Schedules & Date Overrides')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get current weekly schedule and special date overrides' })
  async getAvailability(@Req() req: any) {
    return this.availabilityService.getAvailability(req.user.id);
  }

  @Put('schedule')
  @ApiOperation({ summary: 'Update weekly recurring working hours' })
  async setWeeklySchedule(@Req() req: any, @Body() dto: SetScheduleDto) {
    return this.availabilityService.setWeeklySchedule(req.user.id, dto);
  }

  @Post('overrides')
  @ApiOperation({ summary: 'Add a date override (holiday, day off, or custom hours)' })
  async addOverride(@Req() req: any, @Body() dto: CreateOverrideDto) {
    return this.availabilityService.addOverride(req.user.id, dto);
  }

  @Delete('overrides/:id')
  @ApiOperation({ summary: 'Remove a date override' })
  async deleteOverride(@Req() req: any, @Param('id') id: string) {
    return this.availabilityService.deleteOverride(id, req.user.id);
  }
}

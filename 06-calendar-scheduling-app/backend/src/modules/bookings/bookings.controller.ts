import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus } from '@prisma/client';

@ApiTags('Host Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all bookings for host with status filter' })
  async findAll(
    @Req() req: any,
    @Query('status') status?: BookingStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.bookingsService.findAll(req.user.id, { status, from, to });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details for a single host booking' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.bookingsService.findOne(id, req.user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking as host' })
  async cancelBooking(@Req() req: any, @Param('id') id: string, @Body('reason') reason?: string) {
    return this.bookingsService.cancelBooking(id, req.user.id, reason);
  }
}

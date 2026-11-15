import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';

@ApiTags('Public Scheduling & Client Bookings')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Get public host profile and bookable event types' })
  async getHost(@Param('username') username: string) {
    return this.publicService.getPublicHost(username);
  }

  @Get(':username/:slug')
  @ApiOperation({ summary: 'Get public event details and configuration' })
  async getEvent(@Param('username') username: string, @Param('slug') slug: string) {
    return this.publicService.getPublicEvent(username, slug);
  }

  @Get(':username/:slug/slots')
  @ApiOperation({ summary: 'Compute available real-time time slots for date with buffer times' })
  async getSlots(
    @Param('username') username: string,
    @Param('slug') slug: string,
    @Query('date') date: string,
    @Query('timezone') timezone?: string,
  ) {
    return this.publicService.getAvailableSlots(username, slug, date, timezone);
  }

  @Post(':username/:slug/book')
  @ApiOperation({ summary: 'Book open time slot with double-booking prevention' })
  async bookSlot(
    @Param('username') username: string,
    @Param('slug') slug: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.publicService.bookSlot(username, slug, dto);
  }

  @Get('bookings/:uid')
  @ApiOperation({ summary: 'Get confirmed booking by secret token' })
  async getBooking(@Param('uid') uid: string) {
    return this.publicService.getBookingByUid(uid);
  }

  @Post('bookings/:uid/cancel')
  @ApiOperation({ summary: 'Cancel booking by invitee' })
  async cancelBooking(@Param('uid') uid: string, @Body() dto: CancelBookingDto) {
    return this.publicService.cancelBookingByUid(uid, dto);
  }

  @Post('bookings/:uid/reschedule')
  @ApiOperation({ summary: 'Reschedule booking to new date and time' })
  async rescheduleBooking(@Param('uid') uid: string, @Body() dto: RescheduleBookingDto) {
    return this.publicService.rescheduleBookingByUid(uid, dto);
  }
}

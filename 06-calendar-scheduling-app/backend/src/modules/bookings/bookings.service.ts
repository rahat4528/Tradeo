import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query?: { status?: BookingStatus; from?: string; to?: string }) {
    const where: any = { userId };

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.from || query?.to) {
      where.startTime = {};
      if (query.from) where.startTime.gte = new Date(query.from);
      if (query.to) where.startTime.lte = new Date(query.to);
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        eventType: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { eventType: true, user: { select: { id: true, name: true, email: true, timezone: true } } },
    });

    if (!booking) throw new NotFoundException('Booking not found.');
    if (booking.userId !== userId) throw new ForbiddenException('Access denied to booking.');

    return booking;
  }

  async cancelBooking(id: string, userId: string, reason?: string) {
    const booking = await this.findOne(id, userId);

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason?.trim() || 'Cancelled by host',
      },
      include: { eventType: true },
    });
  }
}

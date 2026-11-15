import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { BookingStatus } from '@prisma/client';

export interface TimeSlot {
  time: string; // "09:00"
  startTimeIso: string; // "2026-11-20T09:00:00.000Z"
  endTimeIso: string; // "2026-11-20T09:30:00.000Z"
  available: boolean;
}

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async getPublicHost(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        timezone: true,
        eventTypes: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            durationMinutes: true,
            locationType: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Host '@${username}' not found.`);
    }

    return user;
  }

  async getPublicEvent(username: string, slug: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        timezone: true,
      },
    });

    if (!user) throw new NotFoundException(`Host '@${username}' not found.`);

    const eventType = await this.prisma.eventType.findUnique({
      where: {
        userId_slug: {
          userId: user.id,
          slug: slug.toLowerCase().trim(),
        },
      },
    });

    if (!eventType || !eventType.isActive) {
      throw new NotFoundException(`Event '${slug}' not found or currently inactive.`);
    }

    return {
      host: user,
      eventType,
    };
  }

  async getAvailableSlots(username: string, slug: string, dateStr: string, inviteeTz?: string): Promise<TimeSlot[]> {
    const { host, eventType } = await this.getPublicEvent(username, slug);

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new BadRequestException('Query date must be formatted as YYYY-MM-DD.');
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday, ...

    // 1. Check date override
    const override = await this.prisma.dateOverride.findFirst({
      where: { userId: host.id, date: dateStr },
    });

    if (override && override.isUnavailable) {
      return []; // Entire day is blocked
    }

    // 2. Fetch working hours for this day of week
    let workingWindows: { startTime: string; endTime: string }[] = [];

    if (override && override.startTime && override.endTime) {
      workingWindows = [{ startTime: override.startTime, endTime: override.endTime }];
    } else {
      const schedules = await this.prisma.schedule.findMany({
        where: { userId: host.id, dayOfWeek },
        orderBy: { startTime: 'asc' },
      });
      workingWindows = schedules.map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
    }

    if (workingWindows.length === 0) {
      return []; // Host does not work on this day of week
    }

    // 3. Fetch all confirmed bookings for this host on this day (with buffer considerations)
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const confirmedBookings = await this.prisma.booking.findMany({
      where: {
        userId: host.id,
        status: BookingStatus.CONFIRMED,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
      include: { eventType: true },
    });

    const slots: TimeSlot[] = [];
    const durationMs = eventType.durationMinutes * 60 * 1000;
    const bufferBeforeMs = (eventType.bufferBefore || 0) * 60 * 1000;
    const bufferAfterMs = (eventType.bufferAfter || 0) * 60 * 1000;
    const now = new Date();
    const minNoticeMs = (eventType.minNoticeHours || 0) * 60 * 60 * 1000;

    for (const window of workingWindows) {
      const [startHour, startMin] = window.startTime.split(':').map(Number);
      const [endHour, endMin] = window.endTime.split(':').map(Number);

      let currentSlotStart = new Date(Date.UTC(year, month - 1, day, startHour, startMin, 0));
      const windowEnd = new Date(Date.UTC(year, month - 1, day, endHour, endMin, 0));

      while (currentSlotStart.getTime() + durationMs <= windowEnd.getTime()) {
        const slotEnd = new Date(currentSlotStart.getTime() + durationMs);

        // Required non-overlapping window including buffers
        const candidateWindowStart = currentSlotStart.getTime() - bufferBeforeMs;
        const candidateWindowEnd = slotEnd.getTime() + bufferAfterMs;

        // Check if current candidate is in past or violates min notice
        const isTooSoon = currentSlotStart.getTime() < (now.getTime() + minNoticeMs);

        // Check overlapping against confirmed bookings
        let hasConflict = isTooSoon;

        if (!hasConflict) {
          for (const b of confirmedBookings) {
            const bBufferBefore = (b.eventType?.bufferBefore || 0) * 60 * 1000;
            const bBufferAfter = (b.eventType?.bufferAfter || 0) * 60 * 1000;

            const existingStart = b.startTime.getTime() - bBufferBefore;
            const existingEnd = b.endTime.getTime() + bBufferAfter;

            // Collision condition: candidateWindowStart < existingEnd && candidateWindowEnd > existingStart
            if (candidateWindowStart < existingEnd && candidateWindowEnd > existingStart) {
              hasConflict = true;
              break;
            }
          }
        }

        const timeStr = `${String(currentSlotStart.getUTCHours()).padStart(2, '0')}:${String(currentSlotStart.getUTCMinutes()).padStart(2, '0')}`;

        if (!hasConflict) {
          slots.push({
            time: timeStr,
            startTimeIso: currentSlotStart.toISOString(),
            endTimeIso: slotEnd.toISOString(),
            available: true,
          });
        }

        // Advance to next slot (step by duration or standard 30/15 min intervals)
        const stepMinutes = Math.min(eventType.durationMinutes, 30);
        currentSlotStart = new Date(currentSlotStart.getTime() + stepMinutes * 60 * 1000);
      }
    }

    return slots;
  }

  async bookSlot(username: string, slug: string, dto: CreateBookingDto) {
    const { host, eventType } = await this.getPublicEvent(username, slug);

    const [year, month, day] = dto.date.split('-').map(Number);
    const [hour, min] = dto.startTime.split(':').map(Number);

    const slotStart = new Date(Date.UTC(year, month - 1, day, hour, min, 0));
    const slotEnd = new Date(slotStart.getTime() + eventType.durationMinutes * 60 * 1000);

    const bufferBeforeMs = (eventType.bufferBefore || 0) * 60 * 1000;
    const bufferAfterMs = (eventType.bufferAfter || 0) * 60 * 1000;
    const windowStart = new Date(slotStart.getTime() - bufferBeforeMs);
    const windowEnd = new Date(slotEnd.getTime() + bufferAfterMs);

    // Double-booking collision check
    const conflict = await this.prisma.booking.findFirst({
      where: {
        userId: host.id,
        status: BookingStatus.CONFIRMED,
        startTime: { lt: windowEnd },
        endTime: { gt: windowStart },
      },
    });

    if (conflict) {
      throw new ConflictException('This time slot is no longer available. Please select another time.');
    }

    const booking = await this.prisma.booking.create({
      data: {
        eventTypeId: eventType.id,
        userId: host.id,
        inviteeName: dto.inviteeName.trim(),
        inviteeEmail: dto.inviteeEmail.toLowerCase().trim(),
        inviteeTimezone: dto.inviteeTimezone || 'UTC',
        inviteeNotes: dto.notes?.trim() || null,
        startTime: slotStart,
        endTime: slotEnd,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        eventType: true,
        user: { select: { id: true, name: true, username: true, email: true, timezone: true } },
      },
    });

    return {
      message: 'Booking successfully confirmed!',
      booking,
      cancellationUrl: `/public/bookings/${booking.uid}/cancel`,
      rescheduleUrl: `/public/bookings/${booking.uid}/reschedule`,
    };
  }

  async getBookingByUid(uid: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { uid },
      include: {
        eventType: true,
        user: { select: { id: true, name: true, username: true, email: true, timezone: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking;
  }

  async cancelBookingByUid(uid: string, dto: CancelBookingDto) {
    const booking = await this.getBookingByUid(uid);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('This booking has already been cancelled.');
    }

    return this.prisma.booking.update({
      where: { uid },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: dto.reason?.trim() || 'Cancelled by invitee',
      },
      include: {
        eventType: true,
        user: { select: { name: true, email: true } },
      },
    });
  }

  async rescheduleBookingByUid(uid: string, dto: RescheduleBookingDto) {
    const booking = await this.getBookingByUid(uid);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot reschedule a cancelled booking.');
    }

    const [year, month, day] = dto.date.split('-').map(Number);
    const [hour, min] = dto.startTime.split(':').map(Number);

    const newStart = new Date(Date.UTC(year, month - 1, day, hour, min, 0));
    const newEnd = new Date(newStart.getTime() + booking.eventType.durationMinutes * 60 * 1000);

    // Collision check excluding current booking
    const conflict = await this.prisma.booking.findFirst({
      where: {
        userId: booking.userId,
        status: BookingStatus.CONFIRMED,
        id: { not: booking.id },
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
    });

    if (conflict) {
      throw new ConflictException('The requested reschedule slot is already booked.');
    }

    return this.prisma.booking.update({
      where: { uid },
      data: {
        startTime: newStart,
        endTime: newEnd,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        eventType: true,
        user: { select: { name: true, email: true } },
      },
    });
  }
}

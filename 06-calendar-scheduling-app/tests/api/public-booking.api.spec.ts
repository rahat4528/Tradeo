import { PublicService } from '../../backend/src/modules/public/public.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { LocationType, BookingStatus } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('PublicService (API & Booking Engine)', () => {
  let service: PublicService;
  let prisma: MockPrismaService;
  const username = 'dr-smith';

  beforeEach(async () => {
    prisma = new MockPrismaService();
    service = new PublicService(prisma as any);

    // Host user
    const host = await prisma.user.create({
      data: {
        username,
        email: 'smith@clinic.org',
        passwordHash: 'hash123',
        name: 'Dr. John Smith',
        timezone: 'UTC',
      },
    });

    // Event type: 30 mins, 5m buffer before & after
    await prisma.eventType.create({
      data: {
        userId: host.id,
        title: '30 Min Consultation',
        slug: 'consultation',
        durationMinutes: 30,
        locationType: LocationType.GOOGLE_MEET,
        bufferBefore: 5,
        bufferAfter: 5,
        isActive: true,
      },
    });

    // Schedules: Mon (1) to Fri (5), 09:00 - 17:00
    for (let d = 1; d <= 5; d++) {
      await prisma.schedule.create({
        data: {
          userId: host.id,
          dayOfWeek: d,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
    }
  });

  it('computes open slots for a working weekday', async () => {
    // 2026-11-20 is a Friday (dayOfWeek = 5)
    const slots = await service.getAvailableSlots(username, 'consultation', '2026-11-20');
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].time).toBe('09:00');
    expect(slots[0].available).toBe(true);
  });

  it('books an open slot and rejects double-booking same slot', async () => {
    const bookingRes = await service.bookSlot(username, 'consultation', {
      date: '2026-11-20',
      startTime: '10:00',
      inviteeName: 'Alice Cooper',
      inviteeEmail: 'alice@rock.com',
      notes: 'Initial checkup discussion',
    });

    expect(bookingRes.booking).toBeDefined();
    expect(bookingRes.booking.status).toBe(BookingStatus.CONFIRMED);
    expect(bookingRes.booking.uid).toBeDefined();

    // Second booking attempt on overlapping time window must throw ConflictException
    await expect(
      service.bookSlot(username, 'consultation', {
        date: '2026-11-20',
        startTime: '10:00',
        inviteeName: 'Bob Dylan',
        inviteeEmail: 'bob@folk.com',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('allows invitee to cancel booking via unique UID', async () => {
    const bookingRes = await service.bookSlot(username, 'consultation', {
      date: '2026-11-20',
      startTime: '11:00',
      inviteeName: 'Charlie Watts',
      inviteeEmail: 'charlie@stones.com',
    });

    const cancelled = await service.cancelBookingByUid(bookingRes.booking.uid, {
      reason: 'Schedule change',
    });

    expect(cancelled.status).toBe(BookingStatus.CANCELLED);
    expect(cancelled.cancellationReason).toBe('Schedule change');
  });
});

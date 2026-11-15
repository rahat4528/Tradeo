import { BookingsService } from '../../backend/src/modules/bookings/bookings.service';
import { EventTypesService } from '../../backend/src/modules/event-types/event-types.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BookingStatus, LocationType } from '@prisma/client';

describe('Calendar Security Tests - Host Isolation', () => {
  let bookingsService: BookingsService;
  let eventTypesService: EventTypesService;
  let prisma: MockPrismaService;

  const hostA = 'usr-host-alpha';
  const hostB = 'usr-host-beta';

  beforeEach(async () => {
    prisma = new MockPrismaService();
    bookingsService = new BookingsService(prisma as any);
    eventTypesService = new EventTypesService(prisma as any);

    // Host A event & booking
    const etA = await prisma.eventType.create({
      data: { id: 'et-alpha', userId: hostA, title: 'Alpha Meeting', slug: 'alpha', durationMinutes: 30, locationType: LocationType.ZOOM },
    });
    await prisma.booking.create({
      data: {
        id: 'bk-alpha',
        eventTypeId: etA.id,
        userId: hostA,
        inviteeName: 'Invitee Alpha',
        inviteeEmail: 'alpha@guest.com',
        startTime: new Date('2026-11-20T10:00:00Z'),
        endTime: new Date('2026-11-20T10:30:00Z'),
        status: BookingStatus.CONFIRMED,
      },
    });

    // Host B event & booking
    const etB = await prisma.eventType.create({
      data: { id: 'et-beta', userId: hostB, title: 'Beta Meeting', slug: 'beta', durationMinutes: 30, locationType: LocationType.GOOGLE_MEET },
    });
    await prisma.booking.create({
      data: {
        id: 'bk-beta',
        eventTypeId: etB.id,
        userId: hostB,
        inviteeName: 'Invitee Beta',
        inviteeEmail: 'beta@guest.com',
        startTime: new Date('2026-11-20T11:00:00Z'),
        endTime: new Date('2026-11-20T11:30:00Z'),
        status: BookingStatus.CONFIRMED,
      },
    });
  });

  it('prevents Host B from viewing Host A private booking', async () => {
    await expect(
      bookingsService.findOne('bk-alpha', hostB),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents Host B from cancelling Host A booking', async () => {
    await expect(
      bookingsService.cancelBooking('bk-alpha', hostB, 'Unauthorized attempt'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents Host B from updating or deleting Host A event type', async () => {
    await expect(
      eventTypesService.update('et-alpha', hostB, { title: 'Hijacked Event' }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      eventTypesService.remove('et-alpha', hostB),
    ).rejects.toThrow(ForbiddenException);
  });
});

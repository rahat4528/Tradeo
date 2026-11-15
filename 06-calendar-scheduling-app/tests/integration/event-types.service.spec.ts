import { EventTypesService } from '../../backend/src/modules/event-types/event-types.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { LocationType } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('EventTypesService (Integration)', () => {
  let service: EventTypesService;
  let prisma: MockPrismaService;
  const userId = 'usr-host-events';

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new EventTypesService(prisma as any);
  });

  it('creates an event type with buffers and parameters', async () => {
    const et = await service.create(userId, {
      title: 'Quick Catchup',
      slug: 'quick-catchup',
      durationMinutes: 15,
      locationType: LocationType.GOOGLE_MEET,
      bufferBefore: 5,
      bufferAfter: 5,
    });

    expect(et.title).toBe('Quick Catchup');
    expect(et.slug).toBe('quick-catchup');
    expect(et.bufferBefore).toBe(5);
  });

  it('prevents duplicate slug for the same host user', async () => {
    await service.create(userId, {
      title: 'Original Call',
      slug: 'same-slug',
      durationMinutes: 30,
      locationType: LocationType.ZOOM,
    });

    await expect(
      service.create(userId, {
        title: 'Conflicting Call',
        slug: 'same-slug',
        durationMinutes: 45,
        locationType: LocationType.PHONE,
      }),
    ).rejects.toThrow(ConflictException);
  });
});

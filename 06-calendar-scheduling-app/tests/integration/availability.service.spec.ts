import { AvailabilityService } from '../../backend/src/modules/availability/availability.service';
import { MockPrismaService } from '../mocks/prisma.mock';

describe('AvailabilityService (Integration)', () => {
  let service: AvailabilityService;
  let prisma: MockPrismaService;
  const userId = 'usr-host-1';

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new AvailabilityService(prisma as any);
  });

  it('sets weekly working schedules atomically', async () => {
    const updated = await service.setWeeklySchedule(userId, {
      schedules: [
        { dayOfWeek: 1, startTime: '08:30', endTime: '16:30' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      ],
    });

    expect(updated.length).toBe(3);
    expect(updated[0].dayOfWeek).toBe(1);
    expect(updated[0].startTime).toBe('08:30');
  });

  it('adds and removes specific date overrides', async () => {
    const override = await service.addOverride(userId, {
      date: '2026-12-25',
      isUnavailable: true,
    });

    expect(override.date).toBe('2026-12-25');
    expect(override.isUnavailable).toBe(true);

    const deleted = await service.deleteOverride(override.id, userId);
    expect(deleted.id).toBe(override.id);

    const check = await service.getAvailability(userId);
    expect(check.overrides.length).toBe(0);
  });
});

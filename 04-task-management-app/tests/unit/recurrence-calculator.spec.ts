import { RecurrenceRule } from '@prisma/client';

describe('Recurrence Date Calculator Unit Tests', () => {
  function getNextRecurrenceDate(
    currentDate: Date,
    rule: RecurrenceRule,
    interval: number = 1,
  ): Date | null {
    if (rule === RecurrenceRule.NONE) return null;

    const next = new Date(currentDate.getTime());
    switch (rule) {
      case RecurrenceRule.DAILY:
        next.setDate(next.getDate() + interval);
        break;
      case RecurrenceRule.WEEKLY:
        next.setDate(next.getDate() + interval * 7);
        break;
      case RecurrenceRule.MONTHLY:
        next.setMonth(next.getMonth() + interval);
        break;
      case RecurrenceRule.YEARLY:
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        return null;
    }
    return next;
  }

  it('should return null for RecurrenceRule.NONE', () => {
    const next = getNextRecurrenceDate(new Date(), RecurrenceRule.NONE);
    expect(next).toBeNull();
  });

  it('should advance exactly 1 day for daily recurrence', () => {
    const base = new Date('2026-06-01T10:00:00Z');
    const next = getNextRecurrenceDate(base, RecurrenceRule.DAILY, 1);
    expect(next?.toISOString()).toBe('2026-06-02T10:00:00.000Z');
  });

  it('should advance 14 days for bi-weekly recurrence (interval=2)', () => {
    const base = new Date('2026-06-01T10:00:00Z');
    const next = getNextRecurrenceDate(base, RecurrenceRule.WEEKLY, 2);
    expect(next?.toISOString()).toBe('2026-06-15T10:00:00.000Z');
  });

  it('should advance 1 month for monthly recurrence', () => {
    const base = new Date('2026-03-15T12:00:00Z');
    const next = getNextRecurrenceDate(base, RecurrenceRule.MONTHLY, 1);
    expect(next?.toISOString()).toBe('2026-04-15T12:00:00.000Z');
  });

  it('should advance 1 year for yearly recurrence', () => {
    const base = new Date('2026-05-20T09:00:00Z');
    const next = getNextRecurrenceDate(base, RecurrenceRule.YEARLY, 1);
    expect(next?.toISOString()).toBe('2027-05-20T09:00:00.000Z');
  });
});

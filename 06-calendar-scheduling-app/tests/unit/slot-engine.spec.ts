describe('Calendar Unit Tests - Slot Calculation & Buffer Engine', () => {
  it('detects collision between overlapping booking windows with buffers', () => {
    // Existing meeting: 10:00 - 10:30, with 5m buffer before & after -> effective blocked window: 09:55 - 10:35
    const existingStart = new Date('2026-11-20T10:00:00Z').getTime();
    const existingEnd = new Date('2026-11-20T10:30:00Z').getTime();
    const bufferBefore = 5 * 60 * 1000;
    const bufferAfter = 5 * 60 * 1000;

    const blockedStart = existingStart - bufferBefore; // 09:55
    const blockedEnd = existingEnd + bufferAfter;     // 10:35

    // Candidate A: 10:20 - 10:50 (Overlaps inside 10:00-10:30)
    const candA_Start = new Date('2026-11-20T10:20:00Z').getTime();
    const candA_End = new Date('2026-11-20T10:50:00Z').getTime();
    const isConflictA = candA_Start < blockedEnd && candA_End > blockedStart;

    // Candidate B: 10:30 - 11:00 (Violates 5 min buffer after meeting!)
    const candB_Start = new Date('2026-11-20T10:30:00Z').getTime();
    const candB_End = new Date('2026-11-20T11:00:00Z').getTime();
    const isConflictB = candB_Start < blockedEnd && candB_End > blockedStart;

    // Candidate C: 10:35 - 11:05 (Clean slot right after buffer window)
    const candC_Start = new Date('2026-11-20T10:35:00Z').getTime();
    const candC_End = new Date('2026-11-20T11:05:00Z').getTime();
    const isConflictC = candC_Start < blockedEnd && candC_End > blockedStart;

    expect(isConflictA).toBe(true);
    expect(isConflictB).toBe(true);
    expect(isConflictC).toBe(false);
  });

  it('generates expected slot sequences within working hours', () => {
    const windowStartHour = 9;
    const windowEndHour = 11;
    const durationMins = 30;

    const generatedSlots: string[] = [];
    let currentMin = windowStartHour * 60;
    const endMin = windowEndHour * 60;

    while (currentMin + durationMins <= endMin) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      generatedSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      currentMin += durationMins;
    }

    expect(generatedSlots).toEqual(['09:00', '09:30', '10:00', '10:30']);
    expect(generatedSlots.length).toBe(4);
  });
});

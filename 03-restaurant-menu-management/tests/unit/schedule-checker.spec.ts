describe('Menu Schedule & Availability Checker Unit Tests', () => {
  function isMenuAvailable(
    menu: { startTime?: string | null; endTime?: string | null; daysOfWeek?: string | null; isPublished: boolean },
    currentDate: Date,
  ): boolean {
    if (!menu.isPublished) return false;

    const day = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
    if (menu.daysOfWeek) {
      const allowed = menu.daysOfWeek.split(',').map((d) => parseInt(d.trim(), 10));
      if (!allowed.includes(day)) {
        return false;
      }
    }

    if (menu.startTime && menu.endTime) {
      const hours = currentDate.getHours().toString().padStart(2, '0');
      const mins = currentDate.getMinutes().toString().padStart(2, '0');
      const curTime = `${hours}:${mins}`;
      if (curTime < menu.startTime || curTime > menu.endTime) {
        return false;
      }
    }

    return true;
  }

  it('should mark menu active if within scheduled time and days', () => {
    // Wednesday 12:30 PM
    const wednesdayNoon = new Date(2026, 4, 13, 12, 30); // 13 May 2026 is a Wednesday (day 3)
    const lunchMenu = {
      isPublished: true,
      startTime: '11:00',
      endTime: '15:00',
      daysOfWeek: '1,2,3,4,5', // Mon-Fri
    };

    expect(isMenuAvailable(lunchMenu, wednesdayNoon)).toBe(true);
  });

  it('should mark menu inactive if outside operating hours', () => {
    // Wednesday 8:00 PM (20:00)
    const wednesdayEvening = new Date(2026, 4, 13, 20, 0);
    const lunchMenu = {
      isPublished: true,
      startTime: '11:00',
      endTime: '15:00',
      daysOfWeek: '1,2,3,4,5',
    };

    expect(isMenuAvailable(lunchMenu, wednesdayEvening)).toBe(false);
  });

  it('should mark weekend brunch inactive on weekdays', () => {
    // Tuesday 11:00 AM
    const tuesdayMorning = new Date(2026, 4, 12, 11, 0);
    const weekendBrunch = {
      isPublished: true,
      startTime: '10:00',
      endTime: '14:00',
      daysOfWeek: '0,6', // Sun, Sat
    };

    expect(isMenuAvailable(weekendBrunch, tuesdayMorning)).toBe(false);
  });

  it('should mark unpublished menu inactive even during hours', () => {
    const sundayNoon = new Date(2026, 4, 17, 12, 0); // Sunday
    const draftMenu = {
      isPublished: false,
      startTime: '10:00',
      endTime: '14:00',
      daysOfWeek: '0,6',
    };

    expect(isMenuAvailable(draftMenu, sundayNoon)).toBe(false);
  });
});

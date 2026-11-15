describe('Calendar Unit Tests - Timezone Normalization', () => {
  it('correctly normalizes UTC timestamp to target IANA timezone strings', () => {
    // 2026-11-20 15:00:00 UTC
    const utcIso = '2026-11-20T15:00:00.000Z';
    const date = new Date(utcIso);

    // In New York (EST, UTC-5), 15:00 UTC is 10:00 AM
    const nyTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);

    // In Tokyo (JST, UTC+9), 15:00 UTC on 20th is 00:00 (midnight) on 21st
    const tokyoTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);

    expect(nyTimeStr).toBe('10:00');
    expect(['24:00', '00:00']).toContain(tokyoTimeStr);
  });

  it('validates IANA timezone identifiers without throwing errors', () => {
    const validTimezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Dhaka', 'Australia/Sydney'];

    for (const tz of validTimezones) {
      expect(() => {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
      }).not.toThrow();
    }
  });
});

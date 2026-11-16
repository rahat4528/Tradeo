describe('Unit: Uptime Calculator', () => {
  function calculateUptimePercentage(totalChecks: number, failedChecks: number): number {
    if (totalChecks <= 0) return 100.0;
    const successfulChecks = totalChecks - failedChecks;
    const percentage = (successfulChecks / totalChecks) * 100;
    return Number(percentage.toFixed(2));
  }

  function determineServiceStatus(uptimePercent: number, hasActiveCriticalIncident: boolean) {
    if (hasActiveCriticalIncident || uptimePercent < 95.0) return 'DOWN';
    if (uptimePercent < 99.5) return 'DEGRADED';
    return 'HEALTHY';
  }

  it('should return 100% when no failed checks occurred', () => {
    expect(calculateUptimePercentage(1000, 0)).toBe(100.0);
  });

  it('should accurately calculate high nine SLA uptime (e.g. 99.9%)', () => {
    // 1 failure out of 1000 checks = 99.9%
    expect(calculateUptimePercentage(1000, 1)).toBe(99.9);
  });

  it('should accurately calculate lower uptime under outage', () => {
    // 50 failures out of 500 checks = 90%
    expect(calculateUptimePercentage(500, 50)).toBe(90.0);
  });

  it('should classify service status correctly based on uptime and incidents', () => {
    expect(determineServiceStatus(99.99, false)).toBe('HEALTHY');
    expect(determineServiceStatus(98.5, false)).toBe('DEGRADED');
    expect(determineServiceStatus(92.0, false)).toBe('DOWN');
    expect(determineServiceStatus(99.99, true)).toBe('DOWN');
  });
});

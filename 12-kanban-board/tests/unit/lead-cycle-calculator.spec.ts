describe('Lead Time & Cycle Time Calculator Unit Tests', () => {
  interface CardTimestamps {
    createdAt: string;
    startedAt?: string | null;
    completedAt?: string | null;
  }

  function calculateCardMetrics(cards: CardTimestamps[]) {
    const completedCards = cards.filter((c) => c.completedAt != null);

    let totalLeadDays = 0;
    for (const c of completedCards) {
      const created = new Date(c.createdAt).getTime();
      const completed = new Date(c.completedAt!).getTime();
      totalLeadDays += Math.max(0, (completed - created) / (1000 * 60 * 60 * 24));
    }
    const avgLeadTime = completedCards.length > 0 ? totalLeadDays / completedCards.length : 0;

    const cardsWithCycle = completedCards.filter((c) => c.startedAt != null);
    let totalCycleDays = 0;
    for (const c of cardsWithCycle) {
      const started = new Date(c.startedAt!).getTime();
      const completed = new Date(c.completedAt!).getTime();
      totalCycleDays += Math.max(0, (completed - started) / (1000 * 60 * 60 * 24));
    }
    const avgCycleTime = cardsWithCycle.length > 0 ? totalCycleDays / cardsWithCycle.length : 0;

    return {
      completedCount: completedCards.length,
      avgLeadTime: Number(avgLeadTime.toFixed(1)),
      avgCycleTime: Number(avgCycleTime.toFixed(1)),
    };
  }

  it('should calculate correct average lead and cycle times', () => {
    const cards: CardTimestamps[] = [
      {
        createdAt: '2026-11-01T00:00:00Z',
        startedAt: '2026-11-03T00:00:00Z',
        completedAt: '2026-11-06T00:00:00Z', // Lead: 5d, Cycle: 3d
      },
      {
        createdAt: '2026-11-02T00:00:00Z',
        startedAt: '2026-11-04T00:00:00Z',
        completedAt: '2026-11-05T00:00:00Z', // Lead: 3d, Cycle: 1d
      },
      {
        createdAt: '2026-11-10T00:00:00Z', // Incomplete card
        startedAt: '2026-11-12T00:00:00Z',
        completedAt: null,
      },
    ];

    const metrics = calculateCardMetrics(cards);
    expect(metrics.completedCount).toBe(2);
    expect(metrics.avgLeadTime).toBe(4.0); // (5 + 3) / 2
    expect(metrics.avgCycleTime).toBe(2.0); // (3 + 1) / 2
  });

  it('should return 0 when no cards are completed', () => {
    const cards: CardTimestamps[] = [
      { createdAt: '2026-11-01T00:00:00Z', startedAt: null, completedAt: null },
    ];
    const metrics = calculateCardMetrics(cards);
    expect(metrics.completedCount).toBe(0);
    expect(metrics.avgLeadTime).toBe(0);
    expect(metrics.avgCycleTime).toBe(0);
  });
});

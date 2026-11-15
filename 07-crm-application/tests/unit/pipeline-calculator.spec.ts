describe('CRM Unit Tests - Sales Pipeline & Forecast Calculator', () => {
  it('calculates weighted revenue forecast across active deals', () => {
    const deals = [
      { value: 100000, probability: 10 },  // 10,000
      { value: 60000, probability: 25 },   // 15,000
      { value: 80000, probability: 50 },   // 40,000
      { value: 120000, probability: 75 },  // 90,000
    ];

    const totalPipeline = deals.reduce((sum, d) => sum + d.value, 0); // 360,000
    const weightedForecast = deals.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0); // 155,000

    expect(totalPipeline).toBe(360000);
    expect(weightedForecast).toBe(155000);
  });

  it('calculates win rate percentage from closed won and closed lost counts', () => {
    const wonCount = 18;
    const lostCount = 6;
    const totalClosed = wonCount + lostCount; // 24

    const winRate = Math.round((wonCount / totalClosed) * 100);
    expect(winRate).toBe(75);
  });

  it('handles zero closed deals gracefully with 0% win rate', () => {
    const wonCount = 0;
    const lostCount = 0;
    const totalClosed = wonCount + lostCount;

    const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;
    expect(winRate).toBe(0);
  });
});

describe('Sprint Velocity & Estimation Calculator', () => {
  interface IssueSummary {
    storyPoints?: number | null;
    isCompleted: boolean;
  }

  function calculateVelocityMetrics(issues: IssueSummary[]) {
    let totalPoints = 0;
    let completedPoints = 0;

    for (const issue of issues) {
      const points = issue.storyPoints || 0;
      totalPoints += points;
      if (issue.isCompleted) {
        completedPoints += points;
      }
    }

    const remainingPoints = totalPoints - completedPoints;
    const completionPercentage =
      totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    return {
      totalPoints,
      completedPoints,
      remainingPoints,
      completionPercentage,
    };
  }

  it('should accurately calculate completed and remaining story points', () => {
    const issues: IssueSummary[] = [
      { storyPoints: 5, isCompleted: true },
      { storyPoints: 8, isCompleted: false },
      { storyPoints: 3, isCompleted: true },
      { storyPoints: 5, isCompleted: false },
    ];

    const metrics = calculateVelocityMetrics(issues);
    expect(metrics.totalPoints).toBe(21);
    expect(metrics.completedPoints).toBe(8);
    expect(metrics.remainingPoints).toBe(13);
    expect(metrics.completionPercentage).toBe(38);
  });

  it('should handle sprint with 100% completion rate', () => {
    const issues: IssueSummary[] = [
      { storyPoints: 3, isCompleted: true },
      { storyPoints: 5, isCompleted: true },
    ];

    const metrics = calculateVelocityMetrics(issues);
    expect(metrics.totalPoints).toBe(8);
    expect(metrics.completedPoints).toBe(8);
    expect(metrics.remainingPoints).toBe(0);
    expect(metrics.completionPercentage).toBe(100);
  });

  it('should handle issues without story points safely', () => {
    const issues: IssueSummary[] = [
      { storyPoints: null, isCompleted: false },
      { storyPoints: undefined, isCompleted: true },
    ];

    const metrics = calculateVelocityMetrics(issues);
    expect(metrics.totalPoints).toBe(0);
    expect(metrics.completedPoints).toBe(0);
    expect(metrics.completionPercentage).toBe(0);
  });
});

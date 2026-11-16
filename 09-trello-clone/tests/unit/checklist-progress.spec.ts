describe('Checklist Progress Calculator (Unit)', () => {
  function computeChecklistProgress(items: { isCompleted: boolean }[]): {
    total: number;
    completed: number;
    percentage: number;
  } {
    const total = items.length;
    if (total === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    const completed = items.filter((i) => i.isCompleted).length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }

  it('returns 0% for empty checklist', () => {
    const res = computeChecklistProgress([]);
    expect(res.total).toBe(0);
    expect(res.completed).toBe(0);
    expect(res.percentage).toBe(0);
  });

  it('calculates partial progress correctly', () => {
    const items = [
      { isCompleted: true },
      { isCompleted: false },
      { isCompleted: true },
      { isCompleted: false },
    ];
    const res = computeChecklistProgress(items);
    expect(res.total).toBe(4);
    expect(res.completed).toBe(2);
    expect(res.percentage).toBe(50);
  });

  it('calculates 100% completion when all items are checked', () => {
    const items = [
      { isCompleted: true },
      { isCompleted: true },
      { isCompleted: true },
    ];
    const res = computeChecklistProgress(items);
    expect(res.completed).toBe(3);
    expect(res.percentage).toBe(100);
  });
});

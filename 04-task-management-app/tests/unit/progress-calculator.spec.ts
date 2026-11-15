describe('Task & Subtask Progress Calculator Unit Tests', () => {
  function calculateProgress(
    subtasks: { isCompleted: boolean }[],
    isParentCompleted: boolean,
  ): { percent: number; completed: number; total: number } {
    const total = subtasks.length;
    const completed = subtasks.filter((s) => s.isCompleted).length;

    let percent = 0;
    if (total > 0) {
      percent = Math.round((completed / total) * 100);
    } else if (isParentCompleted) {
      percent = 100;
    }

    return { percent, completed, total };
  }

  it('should return 0% when task has no subtasks and is not completed', () => {
    const res = calculateProgress([], false);
    expect(res.percent).toBe(0);
    expect(res.total).toBe(0);
    expect(res.completed).toBe(0);
  });

  it('should return 100% when task has no subtasks but is completed', () => {
    const res = calculateProgress([], true);
    expect(res.percent).toBe(100);
  });

  it('should calculate 50% when 2 out of 4 subtasks are completed', () => {
    const subtasks = [
      { isCompleted: true },
      { isCompleted: false },
      { isCompleted: true },
      { isCompleted: false },
    ];
    const res = calculateProgress(subtasks, false);
    expect(res.percent).toBe(50);
    expect(res.completed).toBe(2);
    expect(res.total).toBe(4);
  });

  it('should correctly round percentages (e.g., 2/3 = 67%)', () => {
    const subtasks = [
      { isCompleted: true },
      { isCompleted: true },
      { isCompleted: false },
    ];
    const res = calculateProgress(subtasks, false);
    expect(res.percent).toBe(67);
  });
});

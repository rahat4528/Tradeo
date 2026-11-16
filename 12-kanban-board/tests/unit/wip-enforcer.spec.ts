describe('WIP Limit Enforcer & Capacity Unit Tests', () => {
  interface ColumnCapacity {
    cardCount: number;
    wipLimit: number | null;
  }

  function evaluateWipStatus(col: ColumnCapacity) {
    if (col.wipLimit === null) {
      return { isBreached: false, utilization: null };
    }
    const isBreached = col.cardCount > col.wipLimit;
    const utilization = Math.round((col.cardCount / col.wipLimit) * 100);
    return { isBreached, utilization };
  }

  it('should detect breached WIP limit when card count exceeds limit', () => {
    const status = evaluateWipStatus({ cardCount: 4, wipLimit: 3 });
    expect(status.isBreached).toBe(true);
    expect(status.utilization).toBe(133);
  });

  it('should confirm valid state when card count equals WIP limit', () => {
    const status = evaluateWipStatus({ cardCount: 3, wipLimit: 3 });
    expect(status.isBreached).toBe(false);
    expect(status.utilization).toBe(100);
  });

  it('should calculate under-capacity utilization', () => {
    const status = evaluateWipStatus({ cardCount: 1, wipLimit: 4 });
    expect(status.isBreached).toBe(false);
    expect(status.utilization).toBe(25);
  });

  it('should ignore WIP limit for terminal columns with null limit', () => {
    const status = evaluateWipStatus({ cardCount: 42, wipLimit: null });
    expect(status.isBreached).toBe(false);
    expect(status.utilization).toBeNull();
  });
});

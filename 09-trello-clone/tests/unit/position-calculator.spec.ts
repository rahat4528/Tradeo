describe('Card & List Position Calculator (Unit)', () => {
  function calculateInsertPosition(
    prevPosition: number | null,
    nextPosition: number | null,
    defaultStep = 1000.0,
  ): number {
    if (prevPosition === null && nextPosition === null) {
      return defaultStep;
    }
    if (prevPosition === null && nextPosition !== null) {
      return nextPosition / 2;
    }
    if (prevPosition !== null && nextPosition === null) {
      return prevPosition + defaultStep;
    }
    return (prevPosition! + nextPosition!) / 2;
  }

  it('calculates initial position for empty container', () => {
    expect(calculateInsertPosition(null, null)).toBe(1000.0);
  });

  it('calculates position when appending to the end', () => {
    expect(calculateInsertPosition(2000.0, null)).toBe(3000.0);
  });

  it('calculates position when inserting at the beginning', () => {
    expect(calculateInsertPosition(null, 1000.0)).toBe(500.0);
  });

  it('calculates fractional midpoint between two items', () => {
    expect(calculateInsertPosition(1000.0, 2000.0)).toBe(1500.0);
    expect(calculateInsertPosition(1000.0, 1500.0)).toBe(1250.0);
  });
});

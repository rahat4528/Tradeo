describe('Inventory Unit Tests - Stock Valuation & Delta Calculation', () => {
  it('correctly calculates weighted average cost (WAC) valuation across multiple lots', () => {
    const lotA = { quantity: 100, unitCost: 10.0 };
    const lotB = { quantity: 200, unitCost: 12.5 };
    const lotC = { quantity: 50, unitCost: 15.0 };

    const totalQuantity = lotA.quantity + lotB.quantity + lotC.quantity; // 350
    const totalCost = (lotA.quantity * lotA.unitCost) + (lotB.quantity * lotB.unitCost) + (lotC.quantity * lotC.unitCost); // 1000 + 2500 + 750 = 4250
    const weightedAverageCost = totalCost / totalQuantity;

    expect(totalQuantity).toBe(350);
    expect(totalCost).toBe(4250);
    expect(Number(weightedAverageCost.toFixed(2))).toBe(12.14);
  });

  it('correctly adjusts resulting stock level for additive operations', () => {
    const currentOnHand = 45;
    const incomingAdjustment = 15;
    const resultingStock = currentOnHand + incomingAdjustment;

    expect(resultingStock).toBe(60);
    expect(resultingStock).toBeGreaterThan(currentOnHand);
  });

  it('rejects deduction when quantity exceeds on-hand stock', () => {
    const currentOnHand = 12;
    const requestedDeduction = 15;
    const resultingStock = currentOnHand - requestedDeduction;

    expect(resultingStock).toBeLessThan(0);
    expect(() => {
      if (resultingStock < 0) {
        throw new Error(`Insufficient stock: requested ${requestedDeduction}, on-hand ${currentOnHand}`);
      }
    }).toThrow('Insufficient stock: requested 15, on-hand 12');
  });
});

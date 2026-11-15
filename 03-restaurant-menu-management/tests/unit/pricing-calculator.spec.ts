describe('Menu Item Pricing Calculator Unit Tests', () => {
  interface VariantOption {
    id: string;
    name: string;
    priceDelta: number;
  }

  function calculateItemTotal(
    basePrice: number,
    promoPrice?: number | null,
    selectedOptions: VariantOption[] = [],
  ): number {
    const effectiveBase = promoPrice !== undefined && promoPrice !== null ? promoPrice : basePrice;
    const variantTotal = selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
    return Math.round((effectiveBase + variantTotal) * 100) / 100;
  }

  it('should use base price when no promo price is present', () => {
    const total = calculateItemTotal(16.5);
    expect(total).toBe(16.5);
  });

  it('should apply promotional price when present', () => {
    const total = calculateItemTotal(20.0, 15.0);
    expect(total).toBe(15.0);
  });

  it('should correctly sum selected variant options price deltas', () => {
    const options: VariantOption[] = [
      { id: '1', name: 'Large Size', priceDelta: 3.5 },
      { id: '2', name: 'Extra Truffle', priceDelta: 4.0 },
      { id: '3', name: 'Gluten Free Crust', priceDelta: 2.0 },
    ];

    const total = calculateItemTotal(18.0, null, options);
    // 18.0 + 3.5 + 4.0 + 2.0 = 27.5
    expect(total).toBe(27.5);
  });

  it('should calculate total with both promo price and variant deltas', () => {
    const options: VariantOption[] = [
      { id: '1', name: 'Add Avocado', priceDelta: 2.25 },
      { id: '2', name: 'Oat Milk', priceDelta: 0.75 },
    ];

    const total = calculateItemTotal(12.0, 9.5, options);
    // 9.5 + 2.25 + 0.75 = 12.50
    expect(total).toBe(12.5);
  });
});

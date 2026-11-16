describe('Unit: Threshold Evaluator', () => {
  interface AlertRule {
    metricType: 'CPU' | 'MEMORY' | 'LATENCY' | 'ERROR_RATE';
    operator: 'GT' | 'LT' | 'EQ';
    threshold: number;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
  }

  function evaluateThreshold(rule: AlertRule, actualValue: number): boolean {
    switch (rule.operator) {
      case 'GT':
        return actualValue > rule.threshold;
      case 'LT':
        return actualValue < rule.threshold;
      case 'EQ':
        return actualValue === rule.threshold;
      default:
        return false;
    }
  }

  it('should trigger alert when CPU metric exceeds GT threshold', () => {
    const rule: AlertRule = {
      metricType: 'CPU',
      operator: 'GT',
      threshold: 85,
      severity: 'CRITICAL',
    };
    expect(evaluateThreshold(rule, 92.4)).toBe(true);
    expect(evaluateThreshold(rule, 84.9)).toBe(false);
  });

  it('should trigger alert when memory metric falls below LT threshold', () => {
    const rule: AlertRule = {
      metricType: 'MEMORY',
      operator: 'LT',
      threshold: 20,
      severity: 'WARNING',
    };
    expect(evaluateThreshold(rule, 15.2)).toBe(true);
    expect(evaluateThreshold(rule, 22.0)).toBe(false);
  });

  it('should trigger alert when error rate strictly matches EQ threshold', () => {
    const rule: AlertRule = {
      metricType: 'ERROR_RATE',
      operator: 'EQ',
      threshold: 5,
      severity: 'WARNING',
    };
    expect(evaluateThreshold(rule, 5)).toBe(true);
    expect(evaluateThreshold(rule, 5.1)).toBe(false);
  });

  it('should handle boundary values properly', () => {
    const rule: AlertRule = {
      metricType: 'LATENCY',
      operator: 'GT',
      threshold: 500,
      severity: 'CRITICAL',
    };
    expect(evaluateThreshold(rule, 500)).toBe(false);
    expect(evaluateThreshold(rule, 500.01)).toBe(true);
  });
});

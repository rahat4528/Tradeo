describe('Issue Key Generator Unit Tests', () => {
  function formatIssueKey(projectKey: string, counter: number): string {
    const cleanKey = projectKey.trim().toUpperCase();
    if (!/^[A-Z0-9]+$/.test(cleanKey)) {
      throw new Error('Project key must be uppercase alphanumeric');
    }
    if (counter <= 0 || !Number.isInteger(counter)) {
      throw new Error('Counter must be a positive integer');
    }
    return `${cleanKey}-${counter}`;
  }

  it('should format standard project key and counter', () => {
    const key = formatIssueKey('TRAD', 101);
    expect(key).toBe('TRAD-101');
  });

  it('should automatically uppercase project key', () => {
    const key = formatIssueKey('eng', 42);
    expect(key).toBe('ENG-42');
  });

  it('should reject invalid project key with special characters', () => {
    expect(() => formatIssueKey('TRAD-CORE', 1)).toThrow(
      'Project key must be uppercase alphanumeric',
    );
  });

  it('should reject non-positive counter values', () => {
    expect(() => formatIssueKey('ENG', 0)).toThrow('Counter must be a positive integer');
    expect(() => formatIssueKey('ENG', -5)).toThrow('Counter must be a positive integer');
  });
});

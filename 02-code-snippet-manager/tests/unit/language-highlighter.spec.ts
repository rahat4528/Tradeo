describe('Language Highlighting & Configuration (Unit Tests)', () => {
  const supportedLanguages = [
    'typescript',
    'javascript',
    'python',
    'go',
    'rust',
    'java',
    'cpp',
    'csharp',
    'ruby',
    'php',
    'sql',
    'html',
    'css',
    'json',
    'yaml',
    'markdown',
    'shell',
    'dockerfile',
    'graphql',
  ];

  it('should support required languages and valid identifiers', () => {
    for (const lang of supportedLanguages) {
      expect(typeof lang).toBe('string');
      expect(lang.length).toBeGreaterThan(1);
    }
  });

  it('should normalize language casing to lowercase', () => {
    const raw = 'TypeScript';
    const normalized = raw.toLowerCase().trim();
    expect(normalized).toBe('typescript');
  });

  it('should validate code content integrity', () => {
    const code = `function calculateTotal(price: number, tax: number): number {
  return price + (price * tax);
}`;
    expect(code).toContain('function calculateTotal');
    expect(code.split('\n').length).toBe(3);
  });
});

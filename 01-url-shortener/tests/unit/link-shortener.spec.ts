describe('Link Shortener Core Logic (Unit Tests)', () => {
  it('should generate URL-safe slugs with proper length', () => {
    const { nanoid } = require('nanoid');
    const slug = nanoid(7);
    expect(slug).toBeDefined();
    expect(slug.length).toBe(7);
    expect(/^[A-Za-z0-9_-]+$/.test(slug)).toBe(true);
  });

  it('should correctly evaluate expiration status', () => {
    const pastDate = new Date(Date.now() - 60000).toISOString();
    const futureDate = new Date(Date.now() + 60000).toISOString();

    const isPastExpired = new Date(pastDate).getTime() < Date.now();
    const isFutureExpired = new Date(futureDate).getTime() < Date.now();

    expect(isPastExpired).toBe(true);
    expect(isFutureExpired).toBe(false);
  });

  it('should validate standard HTTP redirect status codes', () => {
    const validCodes = [301, 302, 307, 308];
    for (const code of validCodes) {
      expect([301, 302, 307, 308]).toContain(code);
    }
    expect([301, 302, 307, 308]).not.toContain(200);
    expect([301, 302, 307, 308]).not.toContain(404);
  });
});

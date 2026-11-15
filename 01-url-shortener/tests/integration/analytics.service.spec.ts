import { AnalyticsService } from '../../backend/src/modules/analytics/analytics.service';
import { MockPrismaService } from '../mocks/prisma.mock';

describe('AnalyticsService (Integration Tests)', () => {
  let analyticsService: AnalyticsService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    analyticsService = new AnalyticsService(prismaMock as any);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should record click telemetry with anonymized IP and parsed user-agent', async () => {
    const link = await prismaMock.link.create({
      data: {
        slug: 'telemetry-test',
        targetUrl: 'https://example.com',
        userId: 'analyst-1',
      },
    });

    await analyticsService.recordClick(link.id, {
      ip: '198.51.100.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referrer: 'https://twitter.com/post/12345',
      countryHeader: 'US',
    });

    // Check link click count incremented
    const updated = await prismaMock.link.findUnique({ where: { id: link.id } });
    expect(updated?.clickCount).toBe(1);

    // Retrieve analytics
    const report = await analyticsService.getLinkAnalytics(link.id, 'analyst-1');
    expect(report.totalClicks).toBe(1);
    expect(report.uniqueClicks).toBe(1);
    expect(report.browsers).toEqual(expect.arrayContaining([{ name: 'Chrome', count: 1 }]));
    expect(report.referrers).toEqual(expect.arrayContaining([{ source: 'twitter.com', count: 1 }]));
    expect(report.countries).toEqual(expect.arrayContaining([{ code: 'US', count: 1 }]));
  });

  it('should calculate unique clicks accurately for recurring IP addresses', async () => {
    const link = await prismaMock.link.create({
      data: {
        slug: 'unique-test',
        targetUrl: 'https://example.com',
        userId: 'analyst-2',
      },
    });

    // First click from IP
    await analyticsService.recordClick(link.id, {
      ip: '203.0.113.19',
      userAgent: 'Mozilla/5.0',
    });

    // Second click from same IP immediately
    await analyticsService.recordClick(link.id, {
      ip: '203.0.113.19',
      userAgent: 'Mozilla/5.0',
    });

    const report = await analyticsService.getLinkAnalytics(link.id, 'analyst-2');
    expect(report.totalClicks).toBe(2);
    expect(report.uniqueClicks).toBe(1); // Only 1 unique visitor
  });
});

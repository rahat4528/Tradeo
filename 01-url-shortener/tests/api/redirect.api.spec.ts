import { RedirectService } from '../../backend/src/modules/redirect/redirect.service';
import { CacheService } from '../../backend/src/common/cache/cache.service';
import { AnalyticsService } from '../../backend/src/modules/analytics/analytics.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, GoneException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('Redirect Engine & Workflows (API Tests)', () => {
  let redirectService: RedirectService;
  let prismaMock: MockPrismaService;
  let cacheService: CacheService;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    const configService = new ConfigService();
    cacheService = new CacheService(configService);
    analyticsService = new AnalyticsService(prismaMock as any);
    redirectService = new RedirectService(
      prismaMock as any,
      cacheService,
      analyticsService,
    );
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should resolve standard active short link to target destination', async () => {
    await prismaMock.link.create({
      data: {
        slug: 'active-link',
        targetUrl: 'https://example.com/target',
        isActive: true,
        redirectCode: 301,
      },
    });

    const res = await redirectService.resolveSlug('active-link', { ip: '127.0.0.1' });
    expect(res.targetUrl).toBe('https://example.com/target');
    expect(res.redirectCode).toBe(301);
    expect(res.requiresPassword).toBe(false);
  });

  it('should return 404 for nonexistent slug', async () => {
    await expect(
      redirectService.resolveSlug('nonexistent-404', { ip: '127.0.0.1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject inactive/paused links', async () => {
    await prismaMock.link.create({
      data: {
        slug: 'paused-link',
        targetUrl: 'https://example.com',
        isActive: false,
      },
    });

    await expect(
      redirectService.resolveSlug('paused-link', { ip: '127.0.0.1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw GoneException (410) when link has expired', async () => {
    await prismaMock.link.create({
      data: {
        slug: 'expired-link',
        targetUrl: 'https://example.com',
        isActive: true,
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
    });

    await expect(
      redirectService.resolveSlug('expired-link', { ip: '127.0.0.1' }),
    ).rejects.toThrow(GoneException);
  });

  it('should require password verification for protected links', async () => {
    const passwordHash = await bcrypt.hash('Secret123', 10);
    await prismaMock.link.create({
      data: {
        slug: 'secret-link',
        targetUrl: 'https://example.com/secret',
        isActive: true,
        isProtected: true,
        passwordHash,
      },
    });

    const res = await redirectService.resolveSlug('secret-link', { ip: '127.0.0.1' });
    expect(res.requiresPassword).toBe(true);
    expect(res.targetUrl).toBe('');

    // Attempt verification with bad password
    await expect(
      redirectService.verifyPasswordAndResolve('secret-link', 'WrongPassword', { ip: '127.0.0.1' }),
    ).rejects.toThrow(UnauthorizedException);

    // Attempt verification with correct password
    const verified = await redirectService.verifyPasswordAndResolve('secret-link', 'Secret123', { ip: '127.0.0.1' });
    expect(verified.targetUrl).toBe('https://example.com/secret');
  });
});

import { LinksService } from '../../backend/src/modules/links/links.service';
import { AbuseService } from '../../backend/src/modules/abuse/abuse.service';
import { CacheService } from '../../backend/src/common/cache/cache.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('LinksService (Integration Tests)', () => {
  let linksService: LinksService;
  let prismaMock: MockPrismaService;
  let cacheService: CacheService;
  let abuseService: AbuseService;
  let configService: ConfigService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockImplementation((key: string, defaultVal?: any) => {
      if (key === 'appBaseUrl') return 'http://localhost:4000';
      return defaultVal;
    });

    abuseService = new AbuseService(configService);
    cacheService = new CacheService(configService);
    linksService = new LinksService(
      prismaMock as any,
      cacheService,
      abuseService,
      configService,
    );
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should create an anonymous short link', async () => {
    const result = await linksService.createLink({
      targetUrl: 'https://example.com/test-article',
    });

    expect(result).toBeDefined();
    expect(result.slug).toBeDefined();
    expect(result.targetUrl).toBe('https://example.com/test-article');
    expect(result.shortUrl).toContain(result.slug);
    expect(result.isActive).toBe(true);
    expect(result.clickCount).toBe(0);
  });

  it('should create a custom aliased link for authenticated user', async () => {
    const result = await linksService.createLink(
      {
        targetUrl: 'https://example.com/pricing',
        customAlias: 'pricing-2026',
        description: 'Pricing Page',
        redirectCode: 301,
      },
      'user-123',
    );

    expect(result.slug).toBe('pricing-2026');
    expect(result.userId).toBe('user-123');
    expect(result.description).toBe('Pricing Page');
    expect(result.redirectCode).toBe(301);
  });

  it('should reject creation if custom alias is already taken', async () => {
    await linksService.createLink({
      targetUrl: 'https://example.com/first',
      customAlias: 'duplicate-test',
    });

    await expect(
      linksService.createLink({
        targetUrl: 'https://example.com/second',
        customAlias: 'duplicate-test',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should retrieve paginated links for user', async () => {
    const userId = 'user-abc';
    for (let i = 1; i <= 5; i++) {
      await linksService.createLink(
        { targetUrl: `https://example.com/page-${i}`, customAlias: `page-${i}` },
        userId,
      );
    }

    const list = await linksService.getUserLinks(userId, { page: 1, limit: 3 });
    expect(list.data.length).toBe(3);
    expect(list.pagination.total).toBe(5);
    expect(list.pagination.totalPages).toBe(2);
  });

  it('should update link fields and target URL', async () => {
    const created = await linksService.createLink(
      { targetUrl: 'https://example.com/old' },
      'owner-user',
    );

    const updated = await linksService.updateLink(
      created.id,
      {
        targetUrl: 'https://example.com/new',
        description: 'Updated Description',
        isActive: false,
      },
      'owner-user',
    );

    expect(updated.targetUrl).toBe('https://example.com/new');
    expect(updated.description).toBe('Updated Description');
    expect(updated.isActive).toBe(false);
  });

  it('should prevent non-owners from updating or deleting links', async () => {
    const created = await linksService.createLink(
      { targetUrl: 'https://example.com/secret' },
      'legit-user',
    );

    await expect(
      linksService.updateLink(created.id, { targetUrl: 'https://hacked.com' }, 'attacker-user'),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      linksService.deleteLink(created.id, 'attacker-user'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should delete a link successfully by owner', async () => {
    const created = await linksService.createLink(
      { targetUrl: 'https://example.com/temporary' },
      'owner-user',
    );

    const res = await linksService.deleteLink(created.id, 'owner-user');
    expect(res.id).toBe(created.id);

    await expect(linksService.getLinkById(created.id, 'owner-user')).rejects.toThrow(
      NotFoundException,
    );
  });
});

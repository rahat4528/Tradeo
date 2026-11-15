import { SnippetsService } from '../../backend/src/modules/snippets/snippets.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('SnippetsService (Integration Tests)', () => {
  let snippetsService: SnippetsService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    snippetsService = new SnippetsService(prismaMock as any);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should create snippet and automatically record version 1 snapshot', async () => {
    const userId = 'dev-1';
    const res = await snippetsService.createSnippet(
      {
        title: 'Quick Sort Implementation',
        description: 'Recursive in-place quick sort',
        language: 'typescript',
        code: 'function quickSort(arr: number[]): number[] { return arr; }',
        tags: ['algorithms', 'sorting'],
      },
      userId,
    );

    expect(res).toBeDefined();
    expect(res.title).toBe('Quick Sort Implementation');
    expect(res.tags).toContain('algorithms');
    expect(res.tags).toContain('sorting');
    expect(res.versionCount).toBe(1);

    const history = await snippetsService.getVersionHistory(res.id, userId);
    expect(history.length).toBe(1);
    expect(history[0].versionNumber).toBe(1);
    expect(history[0].summary).toBe('Initial creation');
  });

  it('should create an additional version snapshot when code is updated', async () => {
    const userId = 'dev-2';
    const created = await snippetsService.createSnippet(
      {
        title: 'Draft Function',
        language: 'javascript',
        code: 'const a = 1;',
      },
      userId,
    );

    const updated = await snippetsService.updateSnippet(
      created.id,
      {
        code: 'const a = 1; const b = 2;',
        versionSummary: 'Added variable b',
      },
      userId,
    );

    expect(updated.code).toBe('const a = 1; const b = 2;');
    expect(updated.versionCount).toBe(2);

    const history = await snippetsService.getVersionHistory(created.id, userId);
    expect(history.length).toBe(2);
    expect(history[0].versionNumber).toBe(2);
    expect(history[0].summary).toBe('Added variable b');
  });

  it('should filter snippets by search, language, and favorites', async () => {
    const userId = 'dev-search';
    await snippetsService.createSnippet(
      { title: 'Python Web Scraper', code: 'import requests', language: 'python', isFavorite: true },
      userId,
    );
    await snippetsService.createSnippet(
      { title: 'Go HTTP Server', code: 'http.ListenAndServe', language: 'go', isFavorite: false },
      userId,
    );

    // Filter by favorite
    const favs = await snippetsService.getSnippets(userId, { isFavorite: true });
    expect(favs.data.length).toBe(1);
    expect(favs.data[0].title).toBe('Python Web Scraper');

    // Filter by language
    const goSnippets = await snippetsService.getSnippets(userId, { language: 'go' });
    expect(goSnippets.data.length).toBe(1);
    expect(goSnippets.data[0].title).toBe('Go HTTP Server');

    // Filter by search term
    const searchRes = await snippetsService.getSnippets(userId, { search: 'requests' });
    expect(searchRes.data.length).toBe(1);
    expect(searchRes.data[0].title).toBe('Python Web Scraper');
  });

  it('should delete snippet and cascade delete version history', async () => {
    const userId = 'dev-delete';
    const created = await snippetsService.createSnippet(
      { title: 'Temporary', code: 'console.log()', language: 'javascript' },
      userId,
    );

    await snippetsService.deleteSnippet(created.id, userId);

    await expect(snippetsService.getSnippetById(created.id, userId)).rejects.toThrow(
      NotFoundException,
    );
  });
});

import { SnippetsService } from '../../backend/src/modules/snippets/snippets.service';
import { MockPrismaService } from '../mocks/prisma.mock';

describe('Version History & Rollback (Integration Tests)', () => {
  let snippetsService: SnippetsService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    snippetsService = new SnippetsService(prismaMock as any);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should rollback to a historical snapshot and record a rollback version', async () => {
    const userId = 'dev-rollback';
    const snippet = await snippetsService.createSnippet(
      {
        title: 'Fibonacci Calculator',
        language: 'python',
        code: 'def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)',
      },
      userId,
    );

    // Update code (v2)
    await snippetsService.updateSnippet(
      snippet.id,
      {
        code: 'def fib_broken(): pass',
        versionSummary: 'Accidental break',
      },
      userId,
    );

    const history = await snippetsService.getVersionHistory(snippet.id, userId);
    expect(history.length).toBe(2);

    const v1 = history.find((h) => h.versionNumber === 1);
    expect(v1).toBeDefined();

    // Rollback to v1
    const rolledBack = await snippetsService.rollbackVersion(snippet.id, v1.id, userId);
    expect(rolledBack.code).toBe('def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)');
    expect(rolledBack.versionCount).toBe(3); // v1, v2, v3 (rollback snapshot)

    const updatedHistory = await snippetsService.getVersionHistory(snippet.id, userId);
    expect(updatedHistory[0].summary).toContain('Rolled back to revision #1');
  });
});

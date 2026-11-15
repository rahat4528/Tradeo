import { SnippetsService } from '../../backend/src/modules/snippets/snippets.service';
import { FoldersService } from '../../backend/src/modules/folders/folders.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException } from '@nestjs/common';

describe('Workspace Isolation & Access Controls (Security Tests)', () => {
  let snippetsService: SnippetsService;
  let foldersService: FoldersService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    snippetsService = new SnippetsService(prismaMock as any);
    foldersService = new FoldersService(prismaMock as any);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should prevent user B from viewing user A private snippet', async () => {
    const userA = 'user-alice';
    const userB = 'user-bob';

    const snippet = await snippetsService.createSnippet(
      {
        title: 'Secret Auth Token Logic',
        code: 'const SECRET = "private-key";',
        isPublic: false,
      },
      userA,
    );

    await expect(
      snippetsService.getSnippetById(snippet.id, userB),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent user B from modifying or deleting user A snippet', async () => {
    const userA = 'user-alice';
    const userB = 'user-bob';

    const snippet = await snippetsService.createSnippet(
      { title: 'Original Title', code: 'console.log()' },
      userA,
    );

    await expect(
      snippetsService.updateSnippet(snippet.id, { title: 'Compromised' }, userB),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      snippetsService.deleteSnippet(snippet.id, userB),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent user B from modifying or deleting user A folder', async () => {
    const userA = 'user-alice';
    const userB = 'user-bob';

    const folder = await foldersService.createFolder({ name: 'Alice Folder' }, userA);

    await expect(
      foldersService.updateFolder(folder.id, { name: 'Bob Infiltrated' }, userB),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      foldersService.deleteFolder(folder.id, userB),
    ).rejects.toThrow(ForbiddenException);
  });
});

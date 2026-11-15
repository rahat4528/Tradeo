import { ExportImportService } from '../../backend/src/modules/export-import/export-import.service';
import { SnippetsService } from '../../backend/src/modules/snippets/snippets.service';
import { FoldersService } from '../../backend/src/modules/folders/folders.service';
import { MockPrismaService } from '../mocks/prisma.mock';

describe('Export & Import Workflows (API Tests)', () => {
  let exportImportService: ExportImportService;
  let snippetsService: SnippetsService;
  let foldersService: FoldersService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    exportImportService = new ExportImportService(prismaMock as any);
    snippetsService = new SnippetsService(prismaMock as any);
    foldersService = new FoldersService(prismaMock as any);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should export user workspace into structured JSON', async () => {
    const userId = 'export-user';
    const folder = await foldersService.createFolder({ name: 'Web' }, userId);
    await snippetsService.createSnippet(
      {
        title: 'Fetch API Wrapper',
        code: 'async function apiGet() {}',
        language: 'typescript',
        folderId: folder.id,
        tags: ['web', 'fetch'],
      },
      userId,
    );

    const exported = await exportImportService.exportAll(userId);
    expect(exported.version).toBe('1.0');
    expect(exported.snippets.length).toBe(1);
    expect(exported.snippets[0].title).toBe('Fetch API Wrapper');
    expect(exported.snippets[0].folderName).toBe('Web');
    expect(exported.snippets[0].tags).toContain('web');
  });

  it('should bulk import snippets and recreate folders and tags', async () => {
    const userId = 'import-user';
    const payload = {
      snippets: [
        {
          title: 'Docker Nginx Config',
          code: 'server { listen 80; }',
          language: 'shell',
          folderName: 'DevOps',
          tags: ['docker', 'nginx'],
        },
        {
          title: 'SQL Window Function',
          code: 'SELECT ROW_NUMBER() OVER () FROM users;',
          language: 'sql',
          folderName: 'Database',
          tags: ['sql', 'analytics'],
        },
      ],
    };

    const res = await exportImportService.importSnippets(userId, payload);
    expect(res.importedCount).toBe(2);

    const snippets = await snippetsService.getSnippets(userId, {});
    expect(snippets.data.length).toBe(2);

    const folders = await foldersService.getUserFolders(userId);
    expect(folders.map((f) => f.name)).toContain('DevOps');
    expect(folders.map((f) => f.name)).toContain('Database');
  });
});

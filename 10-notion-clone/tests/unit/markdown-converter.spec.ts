import { PagesService } from '../../backend/src/modules/pages/pages.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { BlockType } from '@prisma/client';

describe('Markdown & HTML Document Exporter (Unit)', () => {
  let service: PagesService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new PagesService(prisma as any);
  });

  const mockPage = {
    id: 'page-1',
    title: 'Release Notes v2.0',
    icon: '🚀',
    workspaceId: 'ws-1',
    parent: null,
    children: [],
    blocks: [
      { type: BlockType.HEADING_1, content: 'Overview' },
      { type: BlockType.PARAGRAPH, content: 'Major upgrade with new features.' },
      { type: BlockType.TODO_LIST, content: 'Deploy database migrations', properties: { checked: true } },
      { type: BlockType.TODO_LIST, content: 'Notify customers', properties: { checked: false } },
      { type: BlockType.CODE_BLOCK, content: 'npm run start:prod', properties: { language: 'bash' } },
      { type: BlockType.CALLOUT, content: 'Zero downtime expected.', properties: { icon: '💡' } },
      { type: BlockType.DIVIDER, content: '' },
    ],
  };

  it('exports page to standard Markdown format', async () => {
    prisma.page.findFirst.mockResolvedValue(mockPage as any);

    const result = await service.exportPage('page-1', 'markdown', 'ws-1');

    expect(result.format).toBe('markdown');
    expect(result.filename).toBe('release-notes-v2.0.md');
    expect(result.content).toContain('# 🚀 Release Notes v2.0');
    expect(result.content).toContain('## Overview');
    expect(result.content).toContain('Major upgrade with new features.');
    expect(result.content).toContain('- [x] Deploy database migrations');
    expect(result.content).toContain('- [ ] Notify customers');
    expect(result.content).toContain('```bash\nnpm run start:prod\n```');
    expect(result.content).toContain('> **Note**: Zero downtime expected.');
    expect(result.content).toContain('---');
  });

  it('exports page to HTML format with embedded styling', async () => {
    prisma.page.findFirst.mockResolvedValue(mockPage as any);

    const result = await service.exportPage('page-1', 'html', 'ws-1');

    expect(result.format).toBe('html');
    expect(result.filename).toBe('release-notes-v2.0.html');
    expect(result.content).toContain('<!DOCTYPE html>');
    expect(result.content).toContain('<h1>🚀 Release Notes v2.0</h1>');
    expect(result.content).toContain('<h2>Overview</h2>');
    expect(result.content).toContain('<p>Major upgrade with new features.</p>');
    expect(result.content).toContain('<input type="checkbox" disabled checked>');
    expect(result.content).toContain('<pre><code>npm run start:prod</code></pre>');
  });
});

import { PagesService } from '../../backend/src/modules/pages/pages.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('PagesService (Integration)', () => {
  let service: PagesService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new PagesService(prisma as any);
  });

  it('creates page with initial paragraph block', async () => {
    const mockCreated = {
      id: 'p-1',
      title: 'Sprint Planning',
      icon: '🎯',
      workspaceId: 'ws-1',
      authorId: 'usr-1',
    };
    prisma.page.findFirst.mockResolvedValue(null);
    prisma.page.create.mockResolvedValue(mockCreated);

    const res = await service.createPage(
      { title: 'Sprint Planning', icon: '🎯' },
      'usr-1',
      'ws-1',
    );

    expect(prisma.page.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Sprint Planning',
          icon: '🎯',
          workspaceId: 'ws-1',
          authorId: 'usr-1',
          blocks: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ type: 'PARAGRAPH' }),
            ]),
          }),
        }),
      }),
    );
    expect(res).toEqual(mockCreated);
  });

  it('lists root pages in workspace with nested sub-pages', async () => {
    prisma.page.findMany.mockResolvedValue([
      { id: 'p-1', title: 'Parent Page', children: [{ id: 'p-2', title: 'Sub Page' }] },
    ]);

    const res = await service.listPages('ws-1');
    expect(res).toHaveLength(1);
    expect(prisma.page.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: 'ws-1',
          parentId: null,
          isArchived: false,
        }),
      }),
    );
  });

  it('soft-deletes page to trash and restores it', async () => {
    prisma.page.findFirst.mockResolvedValue({ id: 'p-1', workspaceId: 'ws-1' });
    prisma.page.update.mockResolvedValue({ id: 'p-1', isArchived: true });

    await service.updatePage('p-1', { isArchived: true }, 'ws-1');
    expect(prisma.page.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p-1' },
        data: expect.objectContaining({ isArchived: true }),
      }),
    );

    prisma.page.update.mockResolvedValue({ id: 'p-1', isArchived: false });
    const restored = await service.restorePage('p-1', 'ws-1');
    expect(restored.isArchived).toBe(false);
  });

  it('permanently purges page from database', async () => {
    prisma.page.findFirst.mockResolvedValue({ id: 'p-purge', workspaceId: 'ws-1' });
    prisma.page.delete.mockResolvedValue({ id: 'p-purge' });

    await service.deletePermanent('p-purge', 'ws-1');
    expect(prisma.page.delete).toHaveBeenCalledWith({ where: { id: 'p-purge' } });
  });
});

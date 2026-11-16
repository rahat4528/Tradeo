import { SearchService } from '../../backend/src/modules/search/search.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('Search API (Contract)', () => {
  let service: SearchService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new SearchService(prisma as any);
  });

  it('searches workspace pages by title and block contents', async () => {
    const mockResults = [
      { id: 'p-1', title: 'Architecture Standards', icon: '📐', updatedAt: new Date() },
    ];
    prisma.page.findMany.mockResolvedValue(mockResults);

    const res = await service.searchWorkspace('Architecture', 'ws-1');
    expect(res).toHaveLength(1);
    expect(prisma.page.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: 'ws-1',
          isArchived: false,
          OR: [
            { title: { contains: 'Architecture', mode: 'insensitive' } },
            { blocks: { some: { content: { contains: 'Architecture', mode: 'insensitive' } } } },
          ],
        }),
      }),
    );
  });

  it('returns empty array when query is blank', async () => {
    const res = await service.searchWorkspace('   ', 'ws-1');
    expect(res).toEqual([]);
    expect(prisma.page.findMany).not.toHaveBeenCalled();
  });
});

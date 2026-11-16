import { PagesService } from '../../backend/src/modules/pages/pages.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';

describe('Workspace Isolation & Page Security (Security)', () => {
  let service: PagesService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new PagesService(prisma as any);
  });

  it('prohibits user from accessing a page in a different workspace', async () => {
    // When queried with workspaceId 'attacker-ws', Prisma returns null because the page belongs to 'victim-ws'
    prisma.page.findFirst.mockResolvedValue(null);

    await expect(service.getPage('victim-page-123', 'attacker-ws')).rejects.toThrow(
      NotFoundException,
    );

    expect(prisma.page.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'victim-page-123', workspaceId: 'attacker-ws' },
      }),
    );
  });

  it('prevents modifying pages belonging to another workspace', async () => {
    prisma.page.findFirst.mockResolvedValue(null);

    await expect(
      service.updatePage('victim-page-123', { title: 'Hacked Title' }, 'attacker-ws'),
    ).rejects.toThrow(NotFoundException);
  });
});

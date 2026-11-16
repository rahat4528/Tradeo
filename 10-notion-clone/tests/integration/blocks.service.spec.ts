import { BlocksService } from '../../backend/src/modules/blocks/blocks.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { BlockType } from '@prisma/client';

describe('BlocksService (Integration)', () => {
  let service: BlocksService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new BlocksService(prisma as any);
  });

  it('creates block in page with calculated position', async () => {
    prisma.page.findUnique.mockResolvedValue({ id: 'p-1' });
    prisma.block.findFirst.mockResolvedValue({ id: 'b-0', position: 1000.0 });

    const mockCreated = {
      id: 'b-1',
      type: BlockType.HEADING_1,
      content: 'Introduction',
      position: 2000.0,
      pageId: 'p-1',
    };
    prisma.block.create.mockResolvedValue(mockCreated);

    const res = await service.createBlock('p-1', {
      type: BlockType.HEADING_1,
      content: 'Introduction',
    });

    expect(prisma.block.create).toHaveBeenCalledWith({
      data: {
        type: BlockType.HEADING_1,
        content: 'Introduction',
        position: 2000.0,
        properties: {},
        pageId: 'p-1',
      },
    });
    expect(res).toEqual(mockCreated);
  });

  it('updates block content and type', async () => {
    prisma.block.findUnique.mockResolvedValue({ id: 'b-1', type: BlockType.PARAGRAPH });
    prisma.block.update.mockResolvedValue({
      id: 'b-1',
      type: BlockType.QUOTE,
      content: 'Important quote',
    });

    const updated = await service.updateBlock('b-1', {
      type: BlockType.QUOTE,
      content: 'Important quote',
    });

    expect(updated.type).toBe(BlockType.QUOTE);
    expect(updated.content).toBe('Important quote');
  });

  it('reorders block to new position', async () => {
    prisma.block.findUnique.mockResolvedValue({ id: 'b-1', position: 1000.0 });
    prisma.block.update.mockResolvedValue({ id: 'b-1', position: 1500.0 });

    const res = await service.reorderBlock('b-1', { newPosition: 1500.0 });
    expect(res.position).toBe(1500.0);
  });

  it('deletes block', async () => {
    prisma.block.findUnique.mockResolvedValue({ id: 'b-del' });
    prisma.block.delete.mockResolvedValue({ id: 'b-del' });

    const res = await service.deleteBlock('b-del');
    expect(res.id).toBe('b-del');
  });
});

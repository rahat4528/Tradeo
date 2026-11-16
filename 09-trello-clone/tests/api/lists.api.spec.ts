import { ListsService } from '../../backend/src/modules/lists/lists.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('Lists API (Contract)', () => {
  let service: ListsService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  const mockGateway = {
    notifyListCreated: jest.fn(),
  };

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new ListsService(prisma as any, mockGateway as any);
  });

  it('creates list on board and notifies websocket gateway', async () => {
    prisma.board.findUnique.mockResolvedValue({ id: 'b-1' });
    prisma.list.findFirst.mockResolvedValue(null);

    const mockCreated = {
      id: 'l-1',
      title: 'Review',
      position: 1000.0,
      boardId: 'b-1',
    };
    prisma.list.create.mockResolvedValue(mockCreated);

    const res = await service.createList('b-1', { title: 'Review' }, 'usr-1');
    expect(res.id).toBe('l-1');
    expect(mockGateway.notifyListCreated).toHaveBeenCalledWith('b-1', mockCreated);
  });

  it('updates list title and position', async () => {
    prisma.list.findUnique.mockResolvedValue({ id: 'l-1' });
    prisma.list.update.mockResolvedValue({ id: 'l-1', title: 'QA Testing', position: 2500.0 });

    const updated = await service.updateList('l-1', { title: 'QA Testing', position: 2500.0 });
    expect(updated.title).toBe('QA Testing');
  });

  it('deletes list', async () => {
    prisma.list.findUnique.mockResolvedValue({ id: 'l-del' });
    prisma.list.delete.mockResolvedValue({ id: 'l-del' });

    const deleted = await service.deleteList('l-del');
    expect(deleted.id).toBe('l-del');
  });
});

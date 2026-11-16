import { CardsService } from '../../backend/src/modules/cards/cards.service';
import { createMockPrismaService } from '../mocks/prisma.mock';

describe('CardsService (Integration)', () => {
  let service: CardsService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let mockGateway: any;

  beforeEach(() => {
    prisma = createMockPrismaService();
    mockGateway = {
      notifyCardCreated: jest.fn(),
      notifyCardMoved: jest.fn(),
      notifyCardUpdated: jest.fn(),
    };
    service = new CardsService(prisma as any, mockGateway as any);
  });

  it('creates card in a list and broadcasts to board', async () => {
    prisma.list.findUnique.mockResolvedValue({
      id: 'list-1',
      title: 'To Do',
      boardId: 'b-1',
    });
    prisma.card.findFirst.mockResolvedValue(null);

    const mockCard = {
      id: 'c-1',
      title: 'Write Unit Tests',
      position: 1000.0,
      listId: 'list-1',
    };
    prisma.card.create.mockResolvedValue(mockCard);
    prisma.activity.create.mockResolvedValue({ id: 'act-1' });

    const res = await service.createCard(
      'list-1',
      { title: 'Write Unit Tests' },
      'usr-1',
    );

    expect(prisma.card.create).toHaveBeenCalled();
    expect(mockGateway.notifyCardCreated).toHaveBeenCalledWith('b-1', mockCard);
    expect(res.id).toBe('c-1');
  });

  it('moves card to another list and notifies listeners', async () => {
    prisma.card.findUnique.mockResolvedValue({
      id: 'c-1',
      title: 'Write Unit Tests',
      listId: 'list-1',
      list: { title: 'To Do', boardId: 'b-1' },
    });

    prisma.list.findUnique.mockResolvedValue({
      id: 'list-2',
      title: 'In Progress',
      boardId: 'b-1',
    });

    const updatedCard = {
      id: 'c-1',
      title: 'Write Unit Tests',
      listId: 'list-2',
      position: 2500.0,
    };
    prisma.card.update.mockResolvedValue(updatedCard);
    prisma.activity.create.mockResolvedValue({ id: 'act-2' });

    const res = await service.moveCard(
      'c-1',
      { targetListId: 'list-2', newPosition: 2500.0 },
      'usr-1',
    );

    expect(prisma.card.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'c-1' },
        data: { listId: 'list-2', position: 2500.0 },
      }),
    );
    expect(mockGateway.notifyCardMoved).toHaveBeenCalledWith(
      'b-1',
      expect.objectContaining({
        cardId: 'c-1',
        sourceListId: 'list-1',
        targetListId: 'list-2',
        newPosition: 2500.0,
      }),
    );
    expect(res.listId).toBe('list-2');
  });

  it('creates checklist and toggles checklist item completion', async () => {
    prisma.card.findUnique.mockResolvedValue({
      id: 'c-1',
      title: 'Setup CI/CD',
    });

    prisma.checklist.create.mockResolvedValue({
      id: 'cl-1',
      title: 'Pipeline Steps',
      cardId: 'c-1',
    });

    const cl = await service.addChecklist('c-1', 'Pipeline Steps');
    expect(cl.id).toBe('cl-1');

    prisma.checklistItem.update.mockResolvedValue({
      id: 'item-1',
      isCompleted: true,
    });

    const toggled = await service.toggleChecklistItem('item-1', true);
    expect(toggled.isCompleted).toBe(true);
  });
});

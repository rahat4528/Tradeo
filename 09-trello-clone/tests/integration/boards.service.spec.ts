import { BoardsService } from '../../backend/src/modules/boards/boards.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { MemberRole } from '@prisma/client';

describe('BoardsService (Integration)', () => {
  let service: BoardsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new BoardsService(prisma as any);
  });

  it('creates board with default lists and owner membership', async () => {
    const mockBoard = {
      id: 'board-1',
      title: 'Sprint 24 Board',
      workspaceId: 'ws-1',
      ownerId: 'usr-1',
      color: '#0079bf',
    };
    prisma.board.create.mockResolvedValue(mockBoard);
    prisma.activity.create.mockResolvedValue({ id: 'act-1' });

    const res = await service.createBoard(
      { title: 'Sprint 24 Board', color: '#0079bf' },
      'usr-1',
      'ws-1',
    );

    expect(prisma.board.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Sprint 24 Board',
          ownerId: 'usr-1',
          lists: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({ title: 'To Do' }),
              expect.objectContaining({ title: 'In Progress' }),
              expect.objectContaining({ title: 'Done' }),
            ]),
          }),
        }),
      }),
    );
    expect(res).toEqual(mockBoard);
  });

  it('lists boards where user is owner or member', async () => {
    prisma.board.findMany.mockResolvedValue([
      { id: 'b-1', title: 'Board 1', ownerId: 'usr-1' },
    ]);

    const list = await service.listBoards('usr-1', 'ws-1');
    expect(list).toHaveLength(1);
    expect(prisma.board.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: 'ws-1',
          isArchived: false,
        }),
      }),
    );
  });

  it('adds user as board collaborator', async () => {
    prisma.board.findUnique.mockResolvedValue({
      id: 'board-1',
      ownerId: 'usr-1',
      members: [{ userId: 'usr-1', role: MemberRole.OWNER }],
    });

    prisma.user.findUnique.mockResolvedValue({
      id: 'usr-2',
      email: 'collaborator@example.com',
    });

    prisma.boardMember.upsert.mockResolvedValue({
      id: 'bm-1',
      boardId: 'board-1',
      userId: 'usr-2',
      role: MemberRole.MEMBER,
    });

    const res = await service.addMember(
      'board-1',
      'collaborator@example.com',
      MemberRole.MEMBER,
      'usr-1',
    );

    expect(prisma.boardMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { boardId_userId: { boardId: 'board-1', userId: 'usr-2' } },
        create: expect.objectContaining({ role: MemberRole.MEMBER }),
      }),
    );
  });
});

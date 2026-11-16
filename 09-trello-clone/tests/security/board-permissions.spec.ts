import { BoardsService } from '../../backend/src/modules/boards/boards.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MemberRole } from '@prisma/client';

describe('Board Permissions & Access Control (Security)', () => {
  let service: BoardsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    prisma = createMockPrismaService();
    service = new BoardsService(prisma as any);
  });

  it('rejects access to non-existent board with NotFoundException', async () => {
    prisma.board.findUnique.mockResolvedValue(null);

    await expect(service.getBoard('non-existent', 'usr-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('prohibits access to board for non-members with ForbiddenException', async () => {
    prisma.board.findUnique.mockResolvedValue({
      id: 'board-secret',
      ownerId: 'usr-owner',
      members: [
        { userId: 'usr-owner', role: MemberRole.OWNER },
      ],
      lists: [],
    });

    await expect(service.getBoard('board-secret', 'usr-unauthorized')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('prohibits non-owner member from deleting board', async () => {
    prisma.board.findUnique.mockResolvedValue({
      id: 'board-team',
      ownerId: 'usr-owner',
      members: [
        { userId: 'usr-owner', role: MemberRole.OWNER },
        { userId: 'usr-member', role: MemberRole.MEMBER },
      ],
      lists: [],
    });

    await expect(service.deleteBoard('board-team', 'usr-member')).rejects.toThrow(
      ForbiddenException,
    );
  });
});

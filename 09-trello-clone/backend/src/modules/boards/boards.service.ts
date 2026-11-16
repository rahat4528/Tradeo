import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { MemberRole } from '@prisma/client';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async listBoards(userId: string, workspaceId: string) {
    return this.prisma.board.findMany({
      where: {
        workspaceId,
        isArchived: false,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: { lists: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createBoard(dto: CreateBoardDto, userId: string, workspaceId: string) {
    const board = await this.prisma.board.create({
      data: {
        title: dto.title,
        description: dto.description,
        color: dto.color || '#0079bf',
        workspaceId,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: MemberRole.OWNER,
          },
        },
        lists: {
          create: [
            { title: 'To Do', position: 1000.0 },
            { title: 'In Progress', position: 2000.0 },
            { title: 'Done', position: 3000.0 },
          ],
        },
      },
      include: {
        lists: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    await this.prisma.activity.create({
      data: {
        action: 'CREATED_BOARD',
        details: { boardTitle: board.title },
        boardId: board.id,
        userId,
      },
    });

    return board;
  }

  async getBoard(boardId: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        lists: {
          where: { isArchived: false },
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                checklists: {
                  include: {
                    items: {
                      orderBy: { position: 'asc' },
                    },
                  },
                },
                comments: {
                  include: {
                    author: { select: { id: true, name: true, email: true } },
                  },
                  orderBy: { createdAt: 'desc' },
                },
                members: {
                  include: {
                    user: { select: { id: true, name: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) throw new NotFoundException('Board not found');

    const isMember = board.members.some((m) => m.userId === userId) || board.ownerId === userId;
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return board;
  }

  async updateBoard(boardId: string, dto: UpdateBoardDto, userId: string) {
    await this.getBoard(boardId, userId);

    return this.prisma.board.update({
      where: { id: boardId },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color ? { color: dto.color } : {}),
        ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
      },
    });
  }

  async deleteBoard(boardId: string, userId: string) {
    const board = await this.getBoard(boardId, userId);
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the board owner can delete this board');
    }

    return this.prisma.board.delete({
      where: { id: boardId },
    });
  }

  async addMember(boardId: string, email: string, role: MemberRole = MemberRole.MEMBER, callerUserId: string) {
    const board = await this.getBoard(boardId, callerUserId);

    const userToAdd = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!userToAdd) {
      throw new NotFoundException('User with this email not found');
    }

    return this.prisma.boardMember.upsert({
      where: {
        boardId_userId: {
          boardId,
          userId: userToAdd.id,
        },
      },
      update: { role },
      create: {
        boardId,
        userId: userToAdd.id,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

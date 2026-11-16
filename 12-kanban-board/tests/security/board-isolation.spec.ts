import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from '../../backend/src/modules/boards/boards.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';

describe('Board Tenant Isolation & Security Tests', () => {
  let service: BoardsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('should prevent user from accessing a board owned by another tenant', async () => {
    mockPrisma.board.findFirst.mockResolvedValue(null);

    await expect(service.findOne('board-secret', 'user-attacker')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.board.findFirst).toHaveBeenCalledWith({
      where: { id: 'board-secret', ownerId: 'user-attacker' },
      include: expect.any(Object),
    });
  });

  it('should prevent unauthorized deletion of another tenant board', async () => {
    mockPrisma.board.findFirst.mockResolvedValue(null);

    await expect(service.remove('board-secret', 'user-attacker')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockPrisma.board.delete).not.toHaveBeenCalled();
  });

  it('should return only boards owned by the authenticated caller', async () => {
    mockPrisma.board.findMany.mockResolvedValue([
      { id: 'board-1', title: 'User Board', ownerId: 'user-1' },
    ]);

    const result = await service.findAll('user-1');
    expect(result.length).toBe(1);
    expect(mockPrisma.board.findMany).toHaveBeenCalledWith({
      where: { ownerId: 'user-1' },
      include: expect.any(Object),
      orderBy: { createdAt: 'desc' },
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CardsService } from '../../backend/src/modules/cards/cards.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { Priority } from '@prisma/client';

describe('CardsService Integration', () => {
  let service: CardsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('should create a card and record startedAt if placed in active column', async () => {
    mockPrisma.column.findUnique.mockResolvedValue({
      id: 'col-1',
      title: 'In Development',
      order: 1, // order > 0
    });

    mockPrisma.card.create.mockResolvedValue({
      id: 'card-1',
      title: 'Implement ingress healthcheck',
      columnId: 'col-1',
      priority: Priority.HIGH,
      startedAt: new Date(),
    });

    const card = await service.create('board-1', {
      title: 'Implement ingress healthcheck',
      columnId: 'col-1',
      priority: Priority.HIGH,
    });

    expect(card.id).toBe('card-1');
    expect(card.startedAt).toBeDefined();
    expect(mockPrisma.card.create).toHaveBeenCalled();
  });

  it('should set completedAt timestamp when card moves to terminal column', async () => {
    mockPrisma.card.findUnique.mockResolvedValue({
      id: 'card-1',
      columnId: 'col-1',
      enteredColumnAt: new Date(),
      createdAt: new Date(),
      startedAt: new Date(),
      completedAt: null,
    });

    mockPrisma.column.findUnique.mockResolvedValue({
      id: 'col-done',
      title: 'Shipped to Prod',
      isTerminal: true,
      order: 3,
    });

    mockPrisma.card.update.mockResolvedValue({
      id: 'card-1',
      columnId: 'col-done',
      completedAt: new Date(),
    });

    const updated = await service.update('card-1', {
      columnId: 'col-done',
    });

    expect(updated.columnId).toBe('col-done');
    expect(updated.completedAt).toBeDefined();
  });

  it('should flag card as blocked with reason', async () => {
    mockPrisma.card.findUnique.mockResolvedValue({
      id: 'card-1',
      isBlocked: false,
      enteredColumnAt: new Date(),
      createdAt: new Date(),
    });

    mockPrisma.card.update.mockResolvedValue({
      id: 'card-1',
      isBlocked: true,
      blockReason: 'Waiting on firewall approval',
    });

    const blocked = await service.block('card-1', {
      isBlocked: true,
      blockReason: 'Waiting on firewall approval',
    });

    expect(blocked.isBlocked).toBe(true);
    expect(blocked.blockReason).toBe('Waiting on firewall approval');
  });
});

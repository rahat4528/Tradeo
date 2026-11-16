import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('Kanban Auth API Contract Tests', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register new user and provision default kanban flow board', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'lead@tradeo.io',
      name: 'Flow Manager',
      password: 'hashed-password',
    });
    mockPrisma.board.create.mockResolvedValue({
      id: 'board-1',
      title: 'Main Flow Board',
      ownerId: 'user-1',
    });
    mockPrisma.swimlane.create.mockResolvedValue({ id: 'swim-1' });
    mockPrisma.column.create.mockResolvedValue({ id: 'col-1' });

    const result = await service.register({
      name: 'Flow Manager',
      email: 'lead@tradeo.io',
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.defaultBoardId).toBe('board-1');
    expect(mockPrisma.board.create).toHaveBeenCalled();
  });

  it('should reject registration if email is already taken', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        name: 'Flow Manager',
        email: 'lead@tradeo.io',
        password: 'Password123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should authenticate user with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'lead@tradeo.io',
      password: hashedPassword,
      name: 'Flow Manager',
    });

    const result = await service.login({
      email: 'lead@tradeo.io',
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.user.name).toBe('Flow Manager');
  });

  it('should reject invalid password', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'lead@tradeo.io',
      password: hashedPassword,
    });

    await expect(
      service.login({
        email: 'lead@tradeo.io',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

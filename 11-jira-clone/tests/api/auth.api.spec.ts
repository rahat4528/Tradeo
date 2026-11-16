import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('Auth API Contract & Service Tests', () => {
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

  it('should register new user and provision starter project with default workflows', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'lead@tradeo.io',
      name: 'Engineering Lead',
      password: 'hashed-password',
    });
    mockPrisma.project.create.mockResolvedValue({
      id: 'proj-1',
      key: 'PROJ',
      name: 'My First Project',
      ownerId: 'user-1',
    });
    mockPrisma.workflowState.create.mockResolvedValue({ id: 'state-1' });

    const result = await service.register({
      name: 'Engineering Lead',
      email: 'lead@tradeo.io',
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.user.email).toBe('lead@tradeo.io');
    expect(result.defaultProjectId).toBe('proj-1');
    expect(mockPrisma.project.create).toHaveBeenCalled();
  });

  it('should reject registration if email is already taken', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'existing-id',
      email: 'lead@tradeo.io',
    });

    await expect(
      service.register({
        name: 'Another Lead',
        email: 'lead@tradeo.io',
        password: 'Password123!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should successfully authenticate user with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'lead@tradeo.io',
      password: hashedPassword,
      name: 'Engineering Lead',
    });

    const result = await service.login({
      email: 'lead@tradeo.io',
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.user.name).toBe('Engineering Lead');
  });

  it('should reject authentication with invalid password', async () => {
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

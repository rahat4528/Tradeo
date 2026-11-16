import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { PrismaService } from '../../backend/src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('API: AuthService', () => {
  let service: AuthService;
  let mockPrisma: ReturnType<typeof createMockPrismaService>;
  let mockJwtService: { sign: jest.Mock };

  beforeEach(async () => {
    mockPrisma = createMockPrismaService();
    mockJwtService = { sign: jest.fn().mockReturnValue('mock-jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register a new DevOps engineer and seed default monitored service', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'usr-1',
      email: 'ops@tradeo.io',
      name: 'Ops Lead',
      password: 'hashed-password',
    });
    mockPrisma.service.create.mockResolvedValue({
      id: 'srv-1',
      userId: 'usr-1',
      name: 'API Gateway Ingress',
    });
    mockPrisma.alertRule.create.mockResolvedValue({ id: 'rule-1' });
    mockPrisma.metricSnapshot.create.mockResolvedValue({ id: 'snap-1' });

    const result = await service.register({
      email: 'ops@tradeo.io',
      password: 'Password123!',
      name: 'Ops Lead',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.user.email).toBe('ops@tradeo.io');
    expect(result.defaultServiceId).toBe('srv-1');
    expect(mockPrisma.service.create).toHaveBeenCalled();
    expect(mockPrisma.alertRule.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if registering existing email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'usr-1', email: 'ops@tradeo.io' });

    await expect(
      service.register({
        email: 'ops@tradeo.io',
        password: 'Password123!',
        name: 'Ops Lead',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should authenticate user with valid credentials and return JWT', async () => {
    const hashedPassword = await bcrypt.hash('Secret123!', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'usr-1',
      email: 'ops@tradeo.io',
      name: 'Ops Lead',
      password: hashedPassword,
    });

    const result = await service.login({
      email: 'ops@tradeo.io',
      password: 'Secret123!',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.user.id).toBe('usr-1');
  });

  it('should reject login with invalid password', async () => {
    const hashedPassword = await bcrypt.hash('CorrectPassword!', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'usr-1',
      email: 'ops@tradeo.io',
      name: 'Ops Lead',
      password: hashedPassword,
    });

    await expect(
      service.login({
        email: 'ops@tradeo.io',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login for non-existent email', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'nonexistent@tradeo.io',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

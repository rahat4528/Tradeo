import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('Auth & User Registration API Tests', () => {
  let prisma: MockPrismaService;
  let authService: AuthService;
  let mockJwtService: any;

  beforeEach(() => {
    prisma = new MockPrismaService();
    mockJwtService = {
      sign: jest.fn(() => 'mock_jwt_token_task_flow'),
    };
    authService = new AuthService(prisma as any, mockJwtService);
  });

  it('should register a new user and generate a JWT token', async () => {
    const res = await authService.register({
      email: 'alex@tradeo.io',
      password: 'StrongPassword123!',
      name: 'Alex Developer',
      timezone: 'America/Chicago',
    });

    expect(res).toBeDefined();
    expect(res.token).toBe('mock_jwt_token_task_flow');
    expect(res.user.email).toBe('alex@tradeo.io');
    expect(res.user.name).toBe('Alex Developer');

    // Should also automatically create default category
    expect(prisma.categories.length).toBe(1);
    expect(prisma.categories[0].name).toBe('General');
  });

  it('should reject registration if email is already taken', async () => {
    await authService.register({
      email: 'alex@tradeo.io',
      password: 'Password123!',
    });

    await expect(
      authService.register({
        email: 'alex@tradeo.io',
        password: 'Password456!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should log in with valid credentials', async () => {
    await authService.register({
      email: 'sara@tradeo.io',
      password: 'CorrectPassword!',
      name: 'Sara',
    });

    const loginRes = await authService.login({
      email: 'sara@tradeo.io',
      password: 'CorrectPassword!',
    });

    expect(loginRes.token).toBe('mock_jwt_token_task_flow');
    expect(loginRes.user.name).toBe('Sara');
  });

  it('should reject login with invalid password', async () => {
    await authService.register({
      email: 'sara@tradeo.io',
      password: 'CorrectPassword!',
    });

    await expect(
      authService.login({
        email: 'sara@tradeo.io',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

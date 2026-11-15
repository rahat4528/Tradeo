import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('Authentication API & Workflow (API Tests)', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    jwtService = new JwtService({ secret: 'test-secret' });
    authService = new AuthService(prismaMock as any, jwtService);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should register a new user account with hashed password and return JWT', async () => {
    const res = await authService.register({
      email: 'alex@tradeo.test',
      password: 'SecurePassword123!',
      name: 'Alex Developer',
    });

    expect(res).toBeDefined();
    expect(res.user.email).toBe('alex@tradeo.test');
    expect(res.user.name).toBe('Alex Developer');
    expect(res.token).toBeDefined();
  });

  it('should reject duplicate email registrations', async () => {
    await authService.register({
      email: 'duplicate@tradeo.test',
      password: 'Password1!',
    });

    await expect(
      authService.register({
        email: 'duplicate@tradeo.test',
        password: 'Password2!',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should authenticate valid user credentials with login', async () => {
    await authService.register({
      email: 'login@tradeo.test',
      password: 'CorrectPassword123!',
    });

    const res = await authService.login({
      email: 'login@tradeo.test',
      password: 'CorrectPassword123!',
    });

    expect(res.token).toBeDefined();
    expect(res.user.email).toBe('login@tradeo.test');
  });

  it('should reject login with invalid password', async () => {
    await authService.register({
      email: 'target@tradeo.test',
      password: 'CorrectPassword123!',
    });

    await expect(
      authService.login({
        email: 'target@tradeo.test',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

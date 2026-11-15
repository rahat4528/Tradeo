import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('Auth API & Workspace Credentials (API Tests)', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let prismaMock: MockPrismaService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    jwtService = new JwtService({ secret: 'test-snippets-secret' });
    authService = new AuthService(prismaMock as any, jwtService);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should register a new developer workspace account', async () => {
    const res = await authService.register({
      email: 'dev@snippets.test',
      password: 'StrongPassword123!',
      name: 'Developer One',
    });

    expect(res.user.email).toBe('dev@snippets.test');
    expect(res.token).toBeDefined();
  });

  it('should reject duplicate email registrations', async () => {
    await authService.register({ email: 'dupe@snippets.test', password: 'Pass1' });
    await expect(
      authService.register({ email: 'dupe@snippets.test', password: 'Pass2' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should authenticate user with valid credentials', async () => {
    await authService.register({ email: 'valid@snippets.test', password: 'Password123!' });
    const res = await authService.login({ email: 'valid@snippets.test', password: 'Password123!' });
    expect(res.token).toBeDefined();
  });

  it('should reject authentication with invalid password', async () => {
    await authService.register({ email: 'auth@snippets.test', password: 'Password123!' });
    await expect(
      authService.login({ email: 'auth@snippets.test', password: 'WrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

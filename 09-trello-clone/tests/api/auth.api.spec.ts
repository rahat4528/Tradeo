import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { createMockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('Auth API (Contract & Auth)', () => {
  let authService: AuthService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked.jwt.token'),
  };

  beforeEach(() => {
    prisma = createMockPrismaService();
    authService = new AuthService(prisma as any, mockJwtService as any);
  });

  it('registers user and creates workspace', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'usr-1',
      email: 'pm@example.com',
      name: 'Product Lead',
      workspaces: [{ id: 'ws-1', name: "Product Lead's Workspace" }],
    });

    const res = await authService.register({
      email: 'pm@example.com',
      password: 'Password123!',
      name: 'Product Lead',
    });

    expect(res.token).toBe('mocked.jwt.token');
    expect(res.user.email).toBe('pm@example.com');
  });

  it('rejects duplicate email registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing', email: 'taken@example.com' });

    await expect(
      authService.register({
        email: 'taken@example.com',
        password: 'Password123!',
        name: 'Another User',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('authenticates valid credentials and rejects incorrect password', async () => {
    const passwordHash = await bcrypt.hash('SecretPass123!', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'usr-2',
      email: 'auth@example.com',
      passwordHash,
      workspaces: [{ id: 'ws-2' }],
    });

    const success = await authService.login({
      email: 'auth@example.com',
      password: 'SecretPass123!',
    });
    expect(success.token).toBe('mocked.jwt.token');

    await expect(
      authService.login({
        email: 'auth@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

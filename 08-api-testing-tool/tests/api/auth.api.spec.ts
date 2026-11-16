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

  it('registers a new user and creates workspace with default environment', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'usr-1',
      email: 'test@example.com',
      name: 'Test Tester',
      workspaces: [{ id: 'ws-1', name: "Test Tester's Workspace" }],
    });

    const res = await authService.register({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test Tester',
    });

    expect(res.token).toBe('mocked.jwt.token');
    expect(res.user.email).toBe('test@example.com');
    expect(res.workspace.id).toBe('ws-1');
  });

  it('rejects duplicate email registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing-usr', email: 'taken@example.com' });

    await expect(
      authService.register({
        email: 'taken@example.com',
        password: 'Password123!',
        name: 'Existing User',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('authenticates valid credentials and rejects bad password', async () => {
    const hashed = await bcrypt.hash('CorrectPassword!', 10);
    prisma.user.findUnique.mockResolvedValue({
      id: 'usr-2',
      email: 'login@example.com',
      passwordHash: hashed,
      name: 'Login User',
      workspaces: [{ id: 'ws-2', name: 'Login WS' }],
    });

    const success = await authService.login({
      email: 'login@example.com',
      password: 'CorrectPassword!',
    });
    expect(success.token).toBe('mocked.jwt.token');

    await expect(
      authService.login({
        email: 'login@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

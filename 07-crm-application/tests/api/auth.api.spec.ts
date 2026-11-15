import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AuthService (API / Contract Tests)', () => {
  let authService: AuthService;
  let prisma: MockPrismaService;
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = new MockPrismaService();
    jwtService = new JwtService({ secret: 'test-secret' });
    authService = new AuthService(prisma as any, jwtService);
  });

  it('registers a new CRM company workspace and manager user', async () => {
    const res = await authService.register({
      organizationName: 'Stratton Oakmont Tech',
      name: 'Jordan Belfort',
      email: 'jordan@stratton.com',
      password: 'StrongCrmPassword1!',
      role: UserRole.MANAGER,
    });

    expect(res).toHaveProperty('token');
    expect(res.user.email).toBe('jordan@stratton.com');
    expect(res.user.role).toBe(UserRole.MANAGER);
    expect(prisma.organizations.length).toBe(1);
    expect(prisma.organizations[0].name).toBe('Stratton Oakmont Tech');
  });

  it('authenticates valid credentials and issues signed JWT', async () => {
    await authService.register({
      organizationName: 'Pied Piper Inc',
      name: 'Richard Hendricks',
      email: 'richard@piedpiper.com',
      password: 'MiddleOutCompression1!',
    });

    const loginRes = await authService.login({
      email: 'richard@piedpiper.com',
      password: 'MiddleOutCompression1!',
    });

    expect(loginRes).toHaveProperty('token');
    expect(loginRes.user.email).toBe('richard@piedpiper.com');
  });

  it('rejects incorrect password with UnauthorizedException', async () => {
    await authService.register({
      organizationName: 'Hooli Corp',
      name: 'Gavin Belson',
      email: 'gavin@hooli.com',
      password: 'GavinPassword123!',
    });

    await expect(
      authService.login({
        email: 'gavin@hooli.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

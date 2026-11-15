import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService (API / Contract Tests)', () => {
  let authService: AuthService;
  let prisma: MockPrismaService;
  let jwtService: JwtService;

  beforeEach(() => {
    prisma = new MockPrismaService();
    jwtService = new JwtService({ secret: 'test-secret' });
    authService = new AuthService(prisma as any, jwtService);
  });

  it('registers a new host with default weekly working schedules and meeting template', async () => {
    const res = await authService.register({
      username: 'dr-watson',
      name: 'John Watson',
      email: 'watson@bakerstreet.co.uk',
      password: 'StrongHostPassword1!',
      timezone: 'Europe/London',
    });

    expect(res).toHaveProperty('token');
    expect(res.user.username).toBe('dr-watson');
    expect(res.user.timezone).toBe('Europe/London');

    // Confirm default Mon-Fri schedules initialized
    expect(prisma.schedules.length).toBe(5);
    // Confirm default meeting template initialized
    expect(prisma.eventTypes.length).toBe(1);
    expect(prisma.eventTypes[0].slug).toBe('discovery-meeting');
  });

  it('authenticates valid host credentials and issues signed JWT token', async () => {
    await authService.register({
      username: 'sherlock-holmes',
      name: 'Sherlock Holmes',
      email: 'sherlock@bakerstreet.co.uk',
      password: 'ElementaryPassword123!',
      timezone: 'Europe/London',
    });

    const loginRes = await authService.login({
      email: 'sherlock@bakerstreet.co.uk',
      password: 'ElementaryPassword123!',
    });

    expect(loginRes).toHaveProperty('token');
    expect(loginRes.user.username).toBe('sherlock-holmes');
  });

  it('rejects invalid password with UnauthorizedException', async () => {
    await authService.register({
      username: 'moriarty',
      name: 'Jim Moriarty',
      email: 'moriarty@crime.org',
      password: 'Password999!',
    });

    await expect(
      authService.login({
        email: 'moriarty@crime.org',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

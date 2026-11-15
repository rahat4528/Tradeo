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

  it('registers a new enterprise company, default primary warehouse, and admin user', async () => {
    const result = await authService.register({
      companyName: 'Apex Supply Chain',
      email: 'owner@apexsupply.io',
      password: 'SecurePassword123!',
      name: 'Eleanor Vance',
    });

    expect(result).toHaveProperty('accessToken');
    expect(result.user.email).toBe('owner@apexsupply.io');
    expect(result.user.name).toBe('Eleanor Vance');

    // Verify company & default warehouse created
    expect(prisma.organizations.length).toBe(1);
    expect(prisma.organizations[0].name).toBe('Apex Supply Chain');
    expect(prisma.warehouses.length).toBe(1);
    expect(prisma.warehouses[0].code).toBe('WH-MAIN');
  });

  it('authenticates valid credentials and generates signed JWT token', async () => {
    await authService.register({
      companyName: 'Nordic Wholesale',
      email: 'admin@nordic.com',
      password: 'StrongPassword1!',
      name: 'Lars Lindqvist',
    });

    const loginRes = await authService.login({
      email: 'admin@nordic.com',
      password: 'StrongPassword1!',
    });

    expect(loginRes).toHaveProperty('accessToken');
    expect(loginRes.user.email).toBe('admin@nordic.com');
  });

  it('rejects invalid password with UnauthorizedException', async () => {
    await authService.register({
      companyName: 'Nordic Wholesale',
      email: 'admin2@nordic.com',
      password: 'StrongPassword1!',
      name: 'Lars Lindqvist',
    });

    await expect(
      authService.login({
        email: 'admin2@nordic.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

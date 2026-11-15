import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('Auth & Multi-Restaurant Registration API Tests', () => {
  let prisma: MockPrismaService;
  let authService: AuthService;
  let mockJwtService: any;

  beforeEach(() => {
    prisma = new MockPrismaService();
    mockJwtService = {
      sign: jest.fn(() => 'mock_jwt_token_xyz'),
    };
    authService = new AuthService(
      prisma as any,
      mockJwtService,
    );
  });

  it('should register a new restaurant operator and return JWT token', async () => {
    const res = await authService.register({
      restaurantName: 'Osteria Del Sole',
      restaurantSlug: 'osteria-sole',
      name: 'Chef Mario',
      email: 'mario@sole.com',
      password: 'password123',
    });

    expect(res).toBeDefined();
    expect(res.token).toBe('mock_jwt_token_xyz');
    expect(res.restaurant.slug).toBe('osteria-sole');
    expect(res.restaurant.name).toBe('Osteria Del Sole');
    expect(res.user.email).toBe('mario@sole.com');
  });

  it('should reject registration if restaurant slug already exists', async () => {
    await authService.register({
      restaurantName: 'First Trattoria',
      restaurantSlug: 'trattoria',
      name: 'Mario',
      email: 'mario1@test.com',
      password: 'password123',
    });

    await expect(
      authService.register({
        restaurantName: 'Second Trattoria',
        restaurantSlug: 'trattoria',
        name: 'Luigi',
        email: 'luigi@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should reject registration if user email already exists', async () => {
    await authService.register({
      restaurantName: 'Trattoria One',
      restaurantSlug: 'trattoria-one',
      name: 'Mario',
      email: 'duplicate@test.com',
      password: 'password123',
    });

    await expect(
      authService.register({
        restaurantName: 'Trattoria Two',
        restaurantSlug: 'trattoria-two',
        name: 'Mario',
        email: 'duplicate@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should successfully log in with valid credentials', async () => {
    await authService.register({
      restaurantName: 'Pizzeria Napoli',
      restaurantSlug: 'pizzeria-napoli',
      name: 'Antonio',
      email: 'antonio@napoli.com',
      password: 'supersecretpassword',
    });

    const loginRes = await authService.login({
      email: 'antonio@napoli.com',
      password: 'supersecretpassword',
    });

    expect(loginRes.token).toBe('mock_jwt_token_xyz');
    expect(loginRes.user.name).toBe('Antonio');
  });

  it('should reject login with wrong password', async () => {
    await authService.register({
      restaurantName: 'Pizzeria Roma',
      restaurantSlug: 'pizzeria-roma',
      name: 'Gianni',
      email: 'gianni@roma.com',
      password: 'correctpassword',
    });

    await expect(
      authService.login({
        email: 'gianni@roma.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

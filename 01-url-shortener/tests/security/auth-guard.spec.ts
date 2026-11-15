import { JwtStrategy } from '../../backend/src/modules/auth/jwt.strategy';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('Auth Guards & Security (Security Tests)', () => {
  let jwtStrategy: JwtStrategy;
  let prismaMock: MockPrismaService;
  let configService: ConfigService;

  beforeEach(() => {
    prismaMock = new MockPrismaService();
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockReturnValue('test-secret');
    jwtStrategy = new JwtStrategy(configService, prismaMock as any);
  });

  afterEach(() => {
    prismaMock.reset();
  });

  it('should validate user payload when account exists in database', async () => {
    const user = await prismaMock.user.create({
      data: {
        email: 'guard@tradeo.test',
        passwordHash: 'hash',
        name: 'Guard Test',
        role: 'USER',
      },
    });

    const validated = await jwtStrategy.validate({ sub: user.id, email: user.email });
    expect(validated).toBeDefined();
    expect(validated.id).toBe(user.id);
    expect(validated.email).toBe(user.email);
  });

  it('should throw UnauthorizedException if account has been deleted', async () => {
    await expect(
      jwtStrategy.validate({ sub: 'deleted-user-id', email: 'gone@tradeo.test' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

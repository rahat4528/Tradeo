import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Environment, ServiceStatus, Severity } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
      },
    });

    // Create starter service
    const service = await this.prisma.service.create({
      data: {
        userId: user.id,
        name: 'API Gateway Ingress',
        url: 'https://api.tradeo.io/health',
        environment: Environment.PRODUCTION,
        status: ServiceStatus.HEALTHY,
        uptimePercent: 99.99,
        intervalSeconds: 15,
      },
    });

    // Default alert rules
    await this.prisma.alertRule.create({
      data: {
        serviceId: service.id,
        metricType: 'CPU',
        operator: 'GT',
        threshold: 85.0,
        severity: Severity.CRITICAL,
      },
    });

    await this.prisma.alertRule.create({
      data: {
        serviceId: service.id,
        metricType: 'LATENCY',
        operator: 'GT',
        threshold: 300.0,
        severity: Severity.WARNING,
      },
    });

    // Initial metric snapshot
    await this.prisma.metricSnapshot.create({
      data: {
        serviceId: service.id,
        cpuPercent: 42.5,
        memoryPercent: 55.0,
        requestRate: 650.0,
        latencyMs: 35.0,
        errorRate: 0.01,
      },
    });

    const token = this.generateToken(user.id, user.email);
    const { password, ...result } = user;
    return {
      accessToken: token,
      user: result,
      defaultServiceId: service.id,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user.id, user.email);
    const { password, ...result } = user;
    return {
      accessToken: token,
      user: result,
    };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}

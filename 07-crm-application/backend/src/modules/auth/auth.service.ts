import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const org = await this.prisma.organization.create({
      data: {
        name: dto.organizationName.trim(),
        currency: 'USD',
      },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        organizationId: org.id,
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        role: dto.role || UserRole.MANAGER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    return {
      message: 'CRM organization and manager account registered successfully.',
      user,
      organization: org,
      token,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    return {
      token,
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      organization: user.organization,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            currency: true,
            _count: {
              select: {
                companies: true,
                contacts: true,
                deals: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User profile not found.');
    return user;
  }
}

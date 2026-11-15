import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username.toLowerCase().trim() },
    });
    if (existingUsername) {
      throw new ConflictException('This username is already taken. Please choose another.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username.toLowerCase().trim(),
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        timezone: dto.timezone || 'UTC',
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        timezone: true,
        bio: true,
        createdAt: true,
      },
    });

    // Default schedules: Mon (1) to Fri (5)
    for (let day = 1; day <= 5; day++) {
      await this.prisma.schedule.create({
        data: {
          userId: user.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
    }

    // Default event type
    await this.prisma.eventType.create({
      data: {
        userId: user.id,
        title: '30 Min Discovery Meeting',
        slug: 'discovery-meeting',
        description: 'Quick sync to connect and discuss collaboration opportunities.',
        durationMinutes: 30,
        bufferBefore: 5,
        bufferAfter: 5,
        isActive: true,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      message: 'Host account registered successfully.',
      user,
      token,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      token,
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        bio: user.bio,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        timezone: true,
        bio: true,
        _count: {
          select: {
            eventTypes: true,
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; timezone?: string; bio?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.timezone ? { timezone: data.timezone } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        timezone: true,
        bio: true,
      },
    });
  }
}

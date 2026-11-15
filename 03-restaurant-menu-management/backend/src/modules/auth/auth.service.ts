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
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const cleanSlug = dto.restaurantSlug.toLowerCase().trim();
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingRestaurant) {
      throw new ConflictException(`The restaurant slug '${cleanSlug}' is already claimed.`);
    }

    // Create Restaurant
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: dto.restaurantName.trim(),
        slug: cleanSlug,
      },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create Operator User
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name || null,
        restaurantId: restaurant.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        restaurantId: true,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      message: 'Restaurant and operator account registered successfully.',
      user,
      restaurant,
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { restaurant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      restaurant: user.restaurant,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        restaurant: {
          include: {
            _count: {
              select: { menus: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurant: user.restaurant,
    };
  }
}

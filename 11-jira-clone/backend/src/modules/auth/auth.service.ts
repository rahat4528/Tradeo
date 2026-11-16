import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { StateCategory } from '@prisma/client';

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

    // Create default starter project for user
    const project = await this.prisma.project.create({
      data: {
        name: 'My First Project',
        key: 'PROJ',
        description: 'Default starter project with agile backlog and sprint board.',
        ownerId: user.id,
      },
    });

    // Default workflow states
    const states = [
      { name: 'Backlog', category: StateCategory.TODO, order: 0, isDefault: true },
      { name: 'To Do', category: StateCategory.TODO, order: 1, isDefault: false },
      { name: 'In Progress', category: StateCategory.IN_PROGRESS, order: 2, isDefault: false },
      { name: 'In Review', category: StateCategory.IN_PROGRESS, order: 3, isDefault: false },
      { name: 'Done', category: StateCategory.DONE, order: 4, isDefault: false },
    ];

    for (const s of states) {
      await this.prisma.workflowState.create({
        data: {
          projectId: project.id,
          name: s.name,
          category: s.category,
          order: s.order,
          isDefault: s.isDefault,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    const { password, ...result } = user;
    return {
      accessToken: token,
      user: result,
      defaultProjectId: project.id,
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

  async validateUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}

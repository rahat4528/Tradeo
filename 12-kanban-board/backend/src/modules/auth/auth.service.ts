import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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

    // Create default starter kanban board
    const board = await this.prisma.board.create({
      data: {
        title: 'Main Flow Board',
        description: 'Lean flow board with explicit WIP limits and card aging tracking.',
        ownerId: user.id,
      },
    });

    // Starter swimlanes
    await this.prisma.swimlane.create({
      data: { boardId: board.id, title: 'Expedite (Urgent)', order: 0 },
    });
    await this.prisma.swimlane.create({
      data: { boardId: board.id, title: 'Standard Workflow', order: 1 },
    });

    // Starter columns with WIP limits and policies
    const columns = [
      { title: 'Backlog / Ready', order: 0, wipLimit: 10, isTerminal: false, policy: 'Scope defined and sized.' },
      { title: 'In Development', order: 1, wipLimit: 3, isTerminal: false, policy: 'Active coding. Maximum 3 concurrent items.' },
      { title: 'Code Review & QA', order: 2, wipLimit: 2, isTerminal: false, policy: 'Peer review and CI pass required.' },
      { title: 'Shipped to Prod', order: 3, wipLimit: null, isTerminal: true, policy: 'Deployed and verified live.' },
    ];

    for (const col of columns) {
      await this.prisma.column.create({
        data: {
          boardId: board.id,
          title: col.title,
          order: col.order,
          wipLimit: col.wipLimit,
          isTerminal: col.isTerminal,
          policy: col.policy,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    const { password, ...result } = user;
    return {
      accessToken: token,
      user: result,
      defaultBoardId: board.id,
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

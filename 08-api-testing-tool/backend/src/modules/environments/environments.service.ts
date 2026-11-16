import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(private prisma: PrismaService) {}

  async listEnvironments(workspaceId: string) {
    return this.prisma.environment.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createEnvironment(dto: CreateEnvironmentDto, workspaceId: string) {
    if (dto.isDefault) {
      await this.prisma.environment.updateMany({
        where: { workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.environment.create({
      data: {
        name: dto.name,
        variables: (dto.variables || []) as any,
        isDefault: dto.isDefault || false,
        workspaceId,
      },
    });
  }

  async updateEnvironment(id: string, dto: Partial<CreateEnvironmentDto>, workspaceId: string) {
    const existing = await this.prisma.environment.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Environment not found');

    if (dto.isDefault) {
      await this.prisma.environment.updateMany({
        where: { workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.environment.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.variables ? { variables: dto.variables as any } : {}),
        ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
      },
    });
  }

  async deleteEnvironment(id: string, workspaceId: string) {
    const existing = await this.prisma.environment.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Environment not found');

    return this.prisma.environment.delete({
      where: { id },
    });
  }
}

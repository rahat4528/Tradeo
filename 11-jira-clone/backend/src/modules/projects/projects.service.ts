import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { StateCategory } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: { key: dto.key.toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(`Project with key ${dto.key} already exists`);
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        key: dto.key.toUpperCase(),
        description: dto.description,
        ownerId: userId,
      },
    });

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

    return this.findOne(project.id, userId);
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: { issues: true, sprints: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId: userId },
      include: {
        workflowStates: {
          orderBy: { order: 'asc' },
        },
        sprints: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { issues: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.findOne(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.project.delete({
      where: { id },
    });
  }
}

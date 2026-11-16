import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { SprintStatus, StateCategory } from '@prisma/client';

@Injectable()
export class SprintsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateSprintDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.sprint.create({
      data: {
        projectId,
        name: dto.name,
        goal: dto.goal,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: SprintStatus.FUTURE,
      },
      include: {
        _count: {
          select: { issues: true },
        },
      },
    });
  }

  async findAll(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      include: {
        issues: {
          include: {
            status: true,
            assignee: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        issues: {
          include: {
            status: true,
            assignee: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    return sprint;
  }

  async start(id: string) {
    const sprint = await this.findOne(id);

    // Check if another sprint is currently active in the same project
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        status: SprintStatus.ACTIVE,
        id: { not: id },
      },
    });

    if (activeSprint) {
      throw new ConflictException(
        `Project already has an active sprint: ${activeSprint.name}. Complete it before starting a new sprint.`,
      );
    }

    return this.prisma.sprint.update({
      where: { id },
      data: {
        status: SprintStatus.ACTIVE,
        startDate: sprint.startDate || new Date(),
      },
    });
  }

  async complete(id: string) {
    const sprint = await this.findOne(id);

    // Find all incomplete issues in this sprint (status category != DONE)
    const incompleteIssues = await this.prisma.issue.findMany({
      where: {
        sprintId: id,
        status: {
          category: { not: StateCategory.DONE },
        },
      },
    });

    // Rollover incomplete issues back to project backlog (sprintId = null)
    if (incompleteIssues.length > 0) {
      await this.prisma.issue.updateMany({
        where: {
          id: { in: incompleteIssues.map((i) => i.id) },
        },
        data: {
          sprintId: null,
        },
      });
    }

    return this.prisma.sprint.update({
      where: { id },
      data: {
        status: SprintStatus.CLOSED,
        endDate: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sprint.delete({
      where: { id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { IssuePriority, IssueType } from '@prisma/client';

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, reporterId: string, dto: CreateIssueDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workflowStates: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Determine status: either given statusId or default status (Backlog or first)
    let statusId = dto.statusId;
    if (!statusId) {
      const defaultState =
        project.workflowStates.find((s) => s.isDefault) || project.workflowStates[0];
      statusId = defaultState?.id;
    }

    // Atomically increment issueCounter and generate issue key
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        issueCounter: { increment: 1 },
      },
    });

    const key = `${project.key}-${updatedProject.issueCounter}`;

    return this.prisma.issue.create({
      data: {
        key,
        projectId,
        title: dto.title,
        description: dto.description,
        type: dto.type || IssueType.STORY,
        priority: dto.priority || IssuePriority.MEDIUM,
        statusId,
        sprintId: dto.sprintId || null,
        parentId: dto.parentId || null,
        assigneeId: dto.assigneeId || null,
        reporterId,
        storyPoints: dto.storyPoints || null,
        position: Date.now(),
      },
      include: {
        status: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        parent: {
          select: { id: true, key: true, title: true, type: true },
        },
      },
    });
  }

  async findAll(
    projectId: string,
    filters?: {
      sprintId?: string;
      isBacklog?: boolean;
      type?: IssueType;
      priority?: IssuePriority;
      statusId?: string;
      assigneeId?: string;
      search?: string;
    },
  ) {
    const where: any = { projectId };

    if (filters?.isBacklog) {
      where.sprintId = null;
    } else if (filters?.sprintId) {
      where.sprintId = filters.sprintId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.statusId) {
      where.statusId = filters.statusId;
    }

    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { key: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.issue.findMany({
      where,
      include: {
        status: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        parent: {
          select: { id: true, key: true, title: true, type: true },
        },
        _count: {
          select: { comments: true, subtasks: true },
        },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(idOrKey: string) {
    const issue = await this.prisma.issue.findFirst({
      where: {
        OR: [{ id: idOrKey }, { key: idOrKey }],
      },
      include: {
        status: true,
        project: true,
        sprint: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        parent: {
          select: { id: true, key: true, title: true, type: true },
        },
        subtasks: {
          include: {
            status: true,
            assignee: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue ${idOrKey} not found`);
    }

    return issue;
  }

  async update(id: string, dto: UpdateIssueDto) {
    const existing = await this.findOne(id);

    return this.prisma.issue.update({
      where: { id: existing.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.statusId !== undefined && { statusId: dto.statusId }),
        ...(dto.sprintId !== undefined && { sprintId: dto.sprintId }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.storyPoints !== undefined && { storyPoints: dto.storyPoints }),
        ...(dto.position !== undefined && { position: dto.position }),
      },
      include: {
        status: true,
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        reporter: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        parent: {
          select: { id: true, key: true, title: true, type: true },
        },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.issue.delete({
      where: { id: existing.id },
    });
  }
}

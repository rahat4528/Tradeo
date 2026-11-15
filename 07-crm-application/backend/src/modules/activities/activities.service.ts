import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async createActivity(organizationId: string, userId: string, dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        organizationId,
        userId,
        type: dto.type,
        title: dto.title.trim(),
        body: dto.body.trim(),
        dealId: dto.dealId || null,
        companyId: dto.companyId || null,
        contactId: dto.contactId || null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async getActivities(organizationId: string, query?: { dealId?: string; companyId?: string }) {
    const where: any = { organizationId };
    if (query?.dealId) where.dealId = query.dealId;
    if (query?.companyId) where.companyId = query.companyId;

    return this.prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async createTask(organizationId: string, userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        organizationId,
        userId,
        title: dto.title.trim(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority || 'MEDIUM',
        dealId: dto.dealId || null,
      },
      include: {
        deal: { select: { id: true, title: true } },
      },
    });
  }

  async getTasks(organizationId: string, userId?: string) {
    const where: any = { organizationId };
    if (userId) where.userId = userId;

    return this.prisma.task.findMany({
      where,
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }],
      include: {
        deal: { select: { id: true, title: true } },
      },
    });
  }

  async toggleTaskCompletion(id: string, organizationId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found.');
    if (task.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    return this.prisma.task.update({
      where: { id },
      data: { isCompleted: !task.isCompleted },
    });
  }
}

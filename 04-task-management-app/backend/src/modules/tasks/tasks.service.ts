import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskStatus, RecurrenceRule } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(userId: string, dto: CreateTaskDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found.');
      if (category.userId !== userId) throw new ForbiddenException('Access denied to category.');
    }

    const { subtasks, ...taskData } = dto;

    return this.prisma.task.create({
      data: {
        userId,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        priority: taskData.priority,
        status: taskData.status || TaskStatus.TODO,
        categoryId: taskData.categoryId || null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        recurrence: taskData.recurrence || RecurrenceRule.NONE,
        recurrenceInterval: taskData.recurrenceInterval || 1,
        estimatedMinutes: taskData.estimatedMinutes || null,
        tags: taskData.tags || null,
        subtasks: subtasks && subtasks.length > 0 ? {
          create: subtasks.map((st, idx) => ({
            title: st.title.trim(),
            sortOrder: idx,
          })),
        } : undefined,
      },
      include: {
        category: true,
        subtasks: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async getTasks(userId: string, query: QueryTasksDto) {
    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.tag) {
      where.tags = { contains: query.tag };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (query.filter === 'today') {
      where.dueDate = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (query.filter === 'upcoming') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      where.dueDate = {
        gt: endOfToday,
        lte: nextWeek,
      };
      where.status = { not: TaskStatus.COMPLETED };
    } else if (query.filter === 'overdue') {
      where.dueDate = { lt: startOfToday };
      where.status = { not: TaskStatus.COMPLETED };
    } else if (query.filter === 'completed') {
      where.status = TaskStatus.COMPLETED;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        category: true,
        subtasks: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return tasks.map((task) => {
      const totalSubtasks = task.subtasks.length;
      const completedSubtasks = task.subtasks.filter((st) => st.isCompleted).length;
      const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (task.status === TaskStatus.COMPLETED ? 100 : 0);

      return {
        ...task,
        progressPercent,
        completedSubtasks,
        totalSubtasks,
      };
    });
  }

  async getTaskById(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        subtasks: { orderBy: { sortOrder: 'asc' } },
        reminders: true,
      },
    });

    if (!task) throw new NotFoundException('Task not found.');
    if (task.userId !== userId) throw new ForbiddenException('Access denied to task.');

    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((st) => st.isCompleted).length;
    const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (task.status === TaskStatus.COMPLETED ? 100 : 0);

    return {
      ...task,
      progressPercent,
      completedSubtasks,
      totalSubtasks,
    };
  }

  async updateTask(id: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found.');
    if (task.userId !== userId) throw new ForbiddenException('Access denied to task.');

    if (dto.categoryId !== undefined && dto.categoryId !== null) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Category not found.');
      if (category.userId !== userId) throw new ForbiddenException('Access denied to category.');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.recurrence !== undefined) data.recurrence = dto.recurrence;
    if (dto.recurrenceInterval !== undefined) data.recurrenceInterval = dto.recurrenceInterval;
    if (dto.estimatedMinutes !== undefined) data.estimatedMinutes = dto.estimatedMinutes;
    if (dto.tags !== undefined) data.tags = dto.tags;

    // Check status transition
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
        data.completedAt = new Date();
        // Handle recurrence creation
        if (task.recurrence && task.recurrence !== RecurrenceRule.NONE) {
          await this.scheduleNextRecurringTask(task);
        }
      } else if (dto.status !== TaskStatus.COMPLETED) {
        data.completedAt = null;
      }
    }

    await this.prisma.task.update({
      where: { id },
      data,
    });

    return this.getTaskById(id, userId);
  }

  async deleteTask(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found.');
    if (task.userId !== userId) throw new ForbiddenException('Access denied to task.');

    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted successfully.', id };
  }

  private async scheduleNextRecurringTask(originalTask: any) {
    const baseDate = originalTask.dueDate ? new Date(originalTask.dueDate) : new Date();
    const interval = originalTask.recurrenceInterval || 1;
    let nextDate = new Date(baseDate.getTime());

    switch (originalTask.recurrence) {
      case RecurrenceRule.DAILY:
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case RecurrenceRule.WEEKLY:
        nextDate.setDate(nextDate.getDate() + interval * 7);
        break;
      case RecurrenceRule.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case RecurrenceRule.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
      default:
        return;
    }

    await this.prisma.task.create({
      data: {
        userId: originalTask.userId,
        categoryId: originalTask.categoryId,
        title: originalTask.title,
        description: originalTask.description,
        priority: originalTask.priority,
        status: TaskStatus.TODO,
        dueDate: nextDate,
        recurrence: originalTask.recurrence,
        recurrenceInterval: originalTask.recurrenceInterval,
        estimatedMinutes: originalTask.estimatedMinutes,
        tags: originalTask.tags,
      },
    });
  }
}

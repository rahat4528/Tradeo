import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SubtasksService {
  constructor(private prisma: PrismaService) {}

  async createSubtask(taskId: string, userId: string, title: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new NotFoundException('Parent task not found.');
    if (task.userId !== userId) throw new ForbiddenException('Access denied to parent task.');

    const count = await this.prisma.subtask.count({ where: { taskId } });

    return this.prisma.subtask.create({
      data: {
        taskId,
        title: title.trim(),
        sortOrder: count,
      },
    });
  }

  async toggleSubtask(id: string, userId: string) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!subtask) throw new NotFoundException('Subtask not found.');
    if (subtask.task.userId !== userId) throw new ForbiddenException('Access denied to subtask.');

    const newCompletedState = !subtask.isCompleted;

    return this.prisma.subtask.update({
      where: { id },
      data: {
        isCompleted: newCompletedState,
        completedAt: newCompletedState ? new Date() : null,
      },
    });
  }

  async deleteSubtask(id: string, userId: string) {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      include: { task: true },
    });

    if (!subtask) throw new NotFoundException('Subtask not found.');
    if (subtask.task.userId !== userId) throw new ForbiddenException('Access denied to subtask.');

    await this.prisma.subtask.delete({ where: { id } });
    return { message: 'Subtask deleted successfully.', id };
  }
}

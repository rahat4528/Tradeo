import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaskStatus, Priority } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserSummary(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      include: { category: true },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO || t.status === TaskStatus.BACKLOG).length;

    const overdueTasks = tasks.filter(
      (t) => t.status !== TaskStatus.COMPLETED && t.dueDate && new Date(t.dueDate) < startOfToday,
    ).length;

    const dueTodayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= startOfToday && d <= endOfToday;
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Priority breakdown
    const priorityCounts = {
      CRITICAL: tasks.filter((t) => t.priority === Priority.CRITICAL).length,
      HIGH: tasks.filter((t) => t.priority === Priority.HIGH).length,
      MEDIUM: tasks.filter((t) => t.priority === Priority.MEDIUM).length,
      LOW: tasks.filter((t) => t.priority === Priority.LOW).length,
    };

    // Category breakdown
    const categoryMap: Record<string, { name: string; count: number; color: string }> = {};
    for (const t of tasks) {
      const catKey = t.category ? t.category.id : 'uncategorized';
      const catName = t.category ? t.category.name : 'Uncategorized';
      const catColor = t.category ? t.category.color : '#94A3B8';
      if (!categoryMap[catKey]) {
        categoryMap[catKey] = { name: catName, count: 0, color: catColor };
      }
      categoryMap[catKey].count++;
    }

    // Past 7 days completion velocity
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const completedPastWeek = tasks.filter(
      (t) => t.completedAt && new Date(t.completedAt) >= sevenDaysAgo,
    ).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      dueTodayTasks,
      completionRate,
      completedPastWeek,
      priorityCounts,
      categories: Object.values(categoryMap),
    };
  }
}

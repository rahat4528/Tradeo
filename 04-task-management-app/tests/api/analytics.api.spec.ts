import { AnalyticsService } from '../../backend/src/modules/analytics/analytics.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { Priority, TaskStatus } from '@prisma/client';

describe('Productivity Analytics & Dashboard API Tests', () => {
  let prisma: MockPrismaService;
  let analyticsService: AnalyticsService;

  const USER_ID = 'user_analytics_test';

  beforeEach(() => {
    prisma = new MockPrismaService();
    analyticsService = new AnalyticsService(prisma as any);
  });

  it('should calculate accurate productivity summary statistics', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const tomorrow = new Date(now.getTime() + 86400000);

    // 1 completed task (completed yesterday)
    prisma.tasks.push({
      id: 't1',
      userId: USER_ID,
      title: 'Completed Task',
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      completedAt: yesterday,
      dueDate: yesterday,
    });

    // 1 in-progress task (due today)
    prisma.tasks.push({
      id: 't2',
      userId: USER_ID,
      title: 'In Progress Task',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: now,
    });

    // 1 overdue task (due yesterday, still TODO)
    prisma.tasks.push({
      id: 't3',
      userId: USER_ID,
      title: 'Overdue Task',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: yesterday,
    });

    // 1 future task
    prisma.tasks.push({
      id: 't4',
      userId: USER_ID,
      title: 'Future Task',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: tomorrow,
    });

    const summary = await analyticsService.getUserSummary(USER_ID);

    expect(summary.totalTasks).toBe(4);
    expect(summary.completedTasks).toBe(1);
    expect(summary.inProgressTasks).toBe(1);
    expect(summary.todoTasks).toBe(2);
    expect(summary.overdueTasks).toBe(1);
    expect(summary.dueTodayTasks).toBe(1);
    expect(summary.completionRate).toBe(25); // 1 out of 4 = 25%
    expect(summary.completedPastWeek).toBe(1);
    expect(summary.priorityCounts.CRITICAL).toBe(1);
    expect(summary.priorityCounts.HIGH).toBe(1);
    expect(summary.priorityCounts.MEDIUM).toBe(1);
    expect(summary.priorityCounts.LOW).toBe(1);
  });
});

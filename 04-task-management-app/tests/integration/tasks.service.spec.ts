import { TasksService } from '../../backend/src/modules/tasks/tasks.service';
import { CategoriesService } from '../../backend/src/modules/categories/categories.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { Priority, TaskStatus, RecurrenceRule } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Tasks Service Integration Tests', () => {
  let prisma: MockPrismaService;
  let tasksService: TasksService;
  let categoriesService: CategoriesService;

  const USER_ID = 'user_task_test_01';

  beforeEach(() => {
    prisma = new MockPrismaService();
    tasksService = new TasksService(prisma as any);
    categoriesService = new CategoriesService(prisma as any);
  });

  it('should create a task with nested subtasks', async () => {
    const task = await tasksService.createTask(USER_ID, {
      title: 'Setup Kubernetes Cluster',
      description: 'Deploy ingress-nginx and cert-manager',
      priority: Priority.HIGH,
      subtasks: [
        { title: 'Provision master node' },
        { title: 'Configure worker pool' },
      ],
    });

    expect(task).toBeDefined();
    expect(task.title).toBe('Setup Kubernetes Cluster');
    expect(task.priority).toBe(Priority.HIGH);
    expect(task.subtasks.length).toBe(2);
  });

  it('should filter tasks by status and calculate progress percentage', async () => {
    const task = await tasksService.createTask(USER_ID, {
      title: 'Documentation Sprint',
      subtasks: [
        { title: 'Write Architecture specs' },
        { title: 'Record walkthrough demo' },
      ],
    });

    // Mark 1 subtask completed in mock
    const subtask = prisma.subtasks.find((s) => s.taskId === task.id);
    if (subtask) subtask.isCompleted = true;

    const list = await tasksService.getTasks(USER_ID, { status: TaskStatus.TODO });
    expect(list.length).toBe(1);
    expect(list[0].completedSubtasks).toBe(1);
    expect(list[0].totalSubtasks).toBe(2);
    expect(list[0].progressPercent).toBe(50);
  });

  it('should auto-schedule next occurrence when recurring task is marked COMPLETED', async () => {
    const today = new Date('2026-05-01T12:00:00Z');
    const recurringTask = await tasksService.createTask(USER_ID, {
      title: 'Weekly Standup Summary',
      dueDate: today.toISOString(),
      recurrence: RecurrenceRule.WEEKLY,
      recurrenceInterval: 1,
    });

    // Mark completed
    await tasksService.updateTask(recurringTask.id, USER_ID, {
      status: TaskStatus.COMPLETED,
    });

    // Verify a new task was generated for next week
    const allUserTasks = await tasksService.getTasks(USER_ID, {});
    expect(allUserTasks.length).toBe(2);

    const nextOccurrence = allUserTasks.find(
      (t) => t.id !== recurringTask.id && t.title === 'Weekly Standup Summary',
    );
    expect(nextOccurrence).toBeDefined();
    expect(nextOccurrence?.status).toBe(TaskStatus.TODO);
    expect(new Date(nextOccurrence?.dueDate!).getTime()).toBeGreaterThan(today.getTime());
  });

  it('should delete task and cascade delete its subtasks', async () => {
    const task = await tasksService.createTask(USER_ID, {
      title: 'Temporary Task',
      subtasks: [{ title: 'Sub 1' }, { title: 'Sub 2' }],
    });

    expect(prisma.subtasks.filter((s) => s.taskId === task.id).length).toBe(2);

    await tasksService.deleteTask(task.id, USER_ID);

    expect(prisma.tasks.find((t) => t.id === task.id)).toBeUndefined();
    expect(prisma.subtasks.filter((s) => s.taskId === task.id).length).toBe(0);
  });

  it('should prevent assigning category belonging to another user', async () => {
    const OTHER_USER = 'user_other_02';
    const category = await categoriesService.createCategory(OTHER_USER, {
      name: 'Private List',
    });

    await expect(
      tasksService.createTask(USER_ID, {
        title: 'Unauthorized Category Task',
        categoryId: category.id,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});

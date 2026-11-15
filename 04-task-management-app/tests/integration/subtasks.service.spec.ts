import { TasksService } from '../../backend/src/modules/tasks/tasks.service';
import { SubtasksService } from '../../backend/src/modules/subtasks/subtasks.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Subtasks Service Integration Tests', () => {
  let prisma: MockPrismaService;
  let tasksService: TasksService;
  let subtasksService: SubtasksService;

  const USER_ID = 'user_subtask_test';

  beforeEach(() => {
    prisma = new MockPrismaService();
    tasksService = new TasksService(prisma as any);
    subtasksService = new SubtasksService(prisma as any);
  });

  it('should add subtask to an existing task', async () => {
    const task = await tasksService.createTask(USER_ID, {
      title: 'Build Authentication',
    });

    const subtask = await subtasksService.createSubtask(task.id, USER_ID, 'Add bcrypt password hashing');
    expect(subtask).toBeDefined();
    expect(subtask.title).toBe('Add bcrypt password hashing');
    expect(subtask.isCompleted).toBe(false);
  });

  it('should toggle subtask completion status', async () => {
    const task = await tasksService.createTask(USER_ID, {
      title: 'Refactor Controllers',
    });
    const subtask = await subtasksService.createSubtask(task.id, USER_ID, 'Extract logic to services');

    const toggled = await subtasksService.toggleSubtask(subtask.id, USER_ID);
    expect(toggled.isCompleted).toBe(true);
    expect(toggled.completedAt).toBeDefined();

    const restored = await subtasksService.toggleSubtask(subtask.id, USER_ID);
    expect(restored.isCompleted).toBe(false);
    expect(restored.completedAt).toBeNull();
  });

  it('should delete a subtask', async () => {
    const task = await tasksService.createTask(USER_ID, {
      title: 'Project Cleanup',
    });
    const subtask = await subtasksService.createSubtask(task.id, USER_ID, 'Remove unused styles');

    await subtasksService.deleteSubtask(subtask.id, USER_ID);

    expect(prisma.subtasks.find((s) => s.id === subtask.id)).toBeUndefined();
  });

  it('should reject non-owner from toggling subtask', async () => {
    const task = await tasksService.createTask(USER_ID, {
      title: 'Confidential Task',
    });
    const subtask = await subtasksService.createSubtask(task.id, USER_ID, 'Secret subtask');

    const OTHER_USER = 'user_hacker_99';
    await expect(subtasksService.toggleSubtask(subtask.id, OTHER_USER)).rejects.toThrow(
      ForbiddenException,
    );
  });
});

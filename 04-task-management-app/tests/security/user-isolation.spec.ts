import { TasksService } from '../../backend/src/modules/tasks/tasks.service';
import { CategoriesService } from '../../backend/src/modules/categories/categories.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Task Management User Security & Isolation Tests', () => {
  let prisma: MockPrismaService;
  let tasksService: TasksService;
  let categoriesService: CategoriesService;

  const USER_A = 'user_alpha';
  const USER_B = 'user_beta';

  beforeEach(() => {
    prisma = new MockPrismaService();
    tasksService = new TasksService(prisma as any);
    categoriesService = new CategoriesService(prisma as any);
  });

  it('should prevent User B from retrieving or updating User A task', async () => {
    const taskA = await tasksService.createTask(USER_A, {
      title: 'User A Secret Strategy',
      description: 'Confidential roadmap',
    });

    // User B attempts to read User A's task
    await expect(tasksService.getTaskById(taskA.id, USER_B)).rejects.toThrow(
      ForbiddenException,
    );

    // User B attempts to update User A's task
    await expect(
      tasksService.updateTask(taskA.id, USER_B, {
        title: 'Tampered Title',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent User B from deleting User A task', async () => {
    const taskA = await tasksService.createTask(USER_A, {
      title: 'Crucial User A Task',
    });

    await expect(tasksService.deleteTask(taskA.id, USER_B)).rejects.toThrow(
      ForbiddenException,
    );

    // Verify task still exists
    expect(prisma.tasks.find((t) => t.id === taskA.id)).toBeDefined();
  });

  it('should prevent User B from updating or deleting User A category', async () => {
    const catA = await categoriesService.createCategory(USER_A, {
      name: 'User A Private Category',
    });

    await expect(
      categoriesService.updateCategory(catA.id, USER_B, {
        name: 'Hacked Category',
      }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      categoriesService.deleteCategory(catA.id, USER_B),
    ).rejects.toThrow(ForbiddenException);
  });
});

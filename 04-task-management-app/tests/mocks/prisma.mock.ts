import { Priority, TaskStatus, RecurrenceRule } from '@prisma/client';

export class MockPrismaService {
  users: any[] = [];
  categories: any[] = [];
  tasks: any[] = [];
  subtasks: any[] = [];
  reminders: any[] = [];

  user = {
    findUnique: jest.fn(async ({ where, select }: { where: any; select?: any }) => {
      const found = this.users.find((u) => {
        if (where.id && u.id !== where.id) return false;
        if (where.email && u.email.toLowerCase() !== where.email.toLowerCase()) return false;
        return true;
      });
      if (!found) return null;
      if (select) {
        const res: any = {};
        for (const key of Object.keys(select)) {
          if (key === '_count') {
            res._count = {
              tasks: this.tasks.filter((t) => t.userId === found.id).length,
              categories: this.categories.filter((c) => c.userId === found.id).length,
            };
          } else {
            res[key] = found[key];
          }
        }
        return res;
      }
      return found;
    }),
    create: jest.fn(async ({ data, select }: { data: any; select?: any }) => {
      const created = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        timezone: 'UTC',
        ...data,
      };
      this.users.push(created);
      if (select) {
        const res: any = {};
        for (const key of Object.keys(select)) {
          res[key] = created[key];
        }
        return res;
      }
      return created;
    }),
  };

  category = {
    findUnique: jest.fn(async ({ where }: { where: any }) => {
      return this.categories.find((c) => c.id === where.id) || null;
    }),
    findMany: jest.fn(async ({ where }: { where: any }) => {
      return this.categories
        .filter((c) => c.userId === where.userId)
        .map((c) => ({
          ...c,
          _count: {
            tasks: this.tasks.filter((t) => t.categoryId === c.id).length,
          },
        }));
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const created = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        color: '#6366F1',
        icon: 'folder',
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.categories.push(created);
      return created;
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = this.categories.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Category not found');
      this.categories[idx] = { ...this.categories[idx], ...data, updatedAt: new Date() };
      return this.categories[idx];
    }),
    delete: jest.fn(async ({ where }: { where: any }) => {
      const idx = this.categories.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Category not found');
      return this.categories.splice(idx, 1)[0];
    }),
  };

  task = {
    findUnique: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.tasks.find((t) => t.id === where.id);
      if (!found) return null;
      let res = { ...found };
      if (include?.category) {
        res.category = this.categories.find((c) => c.id === found.categoryId) || null;
      }
      if (include?.subtasks) {
        res.subtasks = this.subtasks.filter((s) => s.taskId === found.id);
      }
      if (include?.reminders) {
        res.reminders = this.reminders.filter((r) => r.taskId === found.id);
      }
      return res;
    }),
    findMany: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      let filtered = this.tasks.filter((t) => {
        if (where.userId && t.userId !== where.userId) return false;
        if (where.status && t.status !== where.status) return false;
        if (where.priority && t.priority !== where.priority) return false;
        if (where.categoryId && t.categoryId !== where.categoryId) return false;
        return true;
      });

      return filtered.map((t) => {
        let res = { ...t };
        if (include?.category) {
          res.category = this.categories.find((c) => c.id === t.categoryId) || null;
        }
        if (include?.subtasks) {
          res.subtasks = this.subtasks.filter((s) => s.taskId === t.id);
        }
        return res;
      });
    }),
    create: jest.fn(async ({ data, include }: { data: any; include?: any }) => {
      const { subtasks: subtasksData, ...taskData } = data;
      const created = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        recurrence: RecurrenceRule.NONE,
        recurrenceInterval: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...taskData,
      };
      this.tasks.push(created);

      let createdSubtasks: any[] = [];
      if (subtasksData?.create) {
        for (const st of subtasksData.create) {
          const subtask = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            taskId: created.id,
            isCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...st,
          };
          this.subtasks.push(subtask);
          createdSubtasks.push(subtask);
        }
      }

      let res = { ...created };
      if (include?.category) {
        res.category = this.categories.find((c) => c.id === created.categoryId) || null;
      }
      if (include?.subtasks) {
        res.subtasks = createdSubtasks;
      }
      return res;
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = this.tasks.findIndex((t) => t.id === where.id);
      if (idx === -1) throw new Error('Task not found');
      this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date() };
      return this.tasks[idx];
    }),
    delete: jest.fn(async ({ where }: { where: any }) => {
      const idx = this.tasks.findIndex((t) => t.id === where.id);
      if (idx === -1) throw new Error('Task not found');
      // Cascade delete subtasks
      this.subtasks = this.subtasks.filter((s) => s.taskId !== where.id);
      return this.tasks.splice(idx, 1)[0];
    }),
  };

  subtask = {
    findUnique: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.subtasks.find((s) => s.id === where.id);
      if (!found) return null;
      let res = { ...found };
      if (include?.task) {
        res.task = this.tasks.find((t) => t.id === found.taskId) || null;
      }
      return res;
    }),
    count: jest.fn(async ({ where }: { where: any }) => {
      return this.subtasks.filter((s) => s.taskId === where.taskId).length;
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const created = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.subtasks.push(created);
      return created;
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = this.subtasks.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error('Subtask not found');
      this.subtasks[idx] = { ...this.subtasks[idx], ...data, updatedAt: new Date() };
      return this.subtasks[idx];
    }),
    delete: jest.fn(async ({ where }: { where: any }) => {
      const idx = this.subtasks.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error('Subtask not found');
      return this.subtasks.splice(idx, 1)[0];
    }),
  };

  $transaction = jest.fn(async (cb: (prisma: any) => Promise<any>) => {
    return cb(this);
  });

  reset() {
    this.users = [];
    this.categories = [];
    this.tasks = [];
    this.subtasks = [];
    this.reminders = [];
    jest.clearAllMocks();
  }
}

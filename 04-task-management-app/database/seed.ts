import { PrismaClient, Priority, TaskStatus, RecurrenceRule } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Task Management database...');

  const passwordHash = await bcrypt.hash('DemoPassword123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@tradeo.io' },
    update: {},
    create: {
      email: 'demo@tradeo.io',
      passwordHash,
      name: 'Alex Rivera',
      timezone: 'America/New_York',
    },
  });

  const workCategory = await prisma.category.create({
    data: {
      userId: demoUser.id,
      name: 'Engineering',
      color: '#3B82F6',
      icon: 'code',
      sortOrder: 1,
    },
  });

  const personalCategory = await prisma.category.create({
    data: {
      userId: demoUser.id,
      name: 'Personal & Health',
      color: '#10B981',
      icon: 'heart',
      sortOrder: 2,
    },
  });

  // Task 1: High Priority with Subtasks
  const task1 = await prisma.task.create({
    data: {
      userId: demoUser.id,
      categoryId: workCategory.id,
      title: 'Architect Redis notification dispatcher',
      description: 'Implement BullMQ worker queue for transactional email and push reminders.',
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      recurrence: RecurrenceRule.NONE,
      tags: 'redis,backend,architecture',
      subtasks: {
        create: [
          { title: 'Define queue schemas and interfaces', isCompleted: true },
          { title: 'Connect to standalone Redis container', isCompleted: true },
          { title: 'Write dead-letter queue retry logic', isCompleted: false },
          { title: 'Deploy integration tests', isCompleted: false },
        ],
      },
    },
  });

  // Task 2: Recurring Task
  const task2 = await prisma.task.create({
    data: {
      userId: demoUser.id,
      categoryId: workCategory.id,
      title: 'Weekly team sprint retrospective',
      description: 'Review velocity metrics, blockers, and backlog priorities.',
      priority: Priority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: new Date(Date.now() + 86400000 * 5),
      recurrence: RecurrenceRule.WEEKLY,
      recurrenceInterval: 1,
      tags: 'agile,meeting,sprint',
    },
  });

  // Task 3: Overdue Critical Task
  const task3 = await prisma.task.create({
    data: {
      userId: demoUser.id,
      categoryId: workCategory.id,
      title: 'Rotate staging database credentials',
      description: 'Update secret manager and restart staging worker pods.',
      priority: Priority.CRITICAL,
      status: TaskStatus.TODO,
      dueDate: new Date(Date.now() - 86400000), // 1 day overdue
      recurrence: RecurrenceRule.NONE,
      tags: 'security,devops',
    },
  });

  // Task 4: Completed Task
  const task4 = await prisma.task.create({
    data: {
      userId: demoUser.id,
      categoryId: personalCategory.id,
      title: 'Morning 5km run',
      description: 'Aerobic fitness routine before work.',
      priority: Priority.LOW,
      status: TaskStatus.COMPLETED,
      completedAt: new Date(),
      dueDate: new Date(),
      recurrence: RecurrenceRule.DAILY,
      tags: 'fitness,health',
    },
  });

  console.log(`Seeding complete: Created 4 sample tasks across 2 categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

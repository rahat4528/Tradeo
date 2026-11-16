import { PrismaClient, MemberRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Trello Clone database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      passwordHash,
      name: 'Project Director',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: 'default-trello-workspace-uuid' },
    update: {},
    create: {
      id: 'default-trello-workspace-uuid',
      name: 'Product Engineering Team',
      description: 'Core product roadmap and sprint delivery',
      ownerId: demoUser.id,
    },
  });

  const board = await prisma.board.create({
    data: {
      title: 'Q1 Product Launch',
      description: 'Major features, bug bashes, and go-to-market milestones',
      color: '#0079bf',
      workspaceId: workspace.id,
      ownerId: demoUser.id,
      members: {
        create: {
          userId: demoUser.id,
          role: MemberRole.OWNER,
        },
      },
    },
  });

  const todoList = await prisma.list.create({
    data: {
      title: 'To Do',
      position: 1000.0,
      boardId: board.id,
    },
  });

  const inProgressList = await prisma.list.create({
    data: {
      title: 'In Progress',
      position: 2000.0,
      boardId: board.id,
    },
  });

  const doneList = await prisma.list.create({
    data: {
      title: 'Done',
      position: 3000.0,
      boardId: board.id,
    },
  });

  const card1 = await prisma.card.create({
    data: {
      title: 'Implement Dark Theme support across dashboards',
      description: 'Provide persistent dark mode toggle with system preference fallback.',
      position: 1000.0,
      dueDate: new Date(Date.now() + 86400000 * 3),
      labels: [{ id: '1', text: 'Feature', color: 'bg-blue-600' }],
      listId: todoList.id,
      checklists: {
        create: {
          title: 'Acceptance Criteria',
          items: {
            create: [
              { title: 'Add CSS variables for background & text', isCompleted: true, position: 100.0 },
              { title: 'Persist preference to local storage', isCompleted: false, position: 200.0 },
              { title: 'Audit contrast ratios for accessibility', isCompleted: false, position: 300.0 },
            ],
          },
        },
      },
      comments: {
        create: {
          content: 'Designs are finalized in the brand guidelines document.',
          authorId: demoUser.id,
        },
      },
    },
  });

  const card2 = await prisma.card.create({
    data: {
      title: 'Multi-factor authentication (MFA) roll-out',
      description: 'TOTP 6-digit authenticator app verification upon login.',
      position: 1000.0,
      dueDate: new Date(Date.now() + 86400000 * 1),
      labels: [{ id: '2', text: 'Security', color: 'bg-red-600' }],
      listId: inProgressList.id,
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        action: 'CREATED_CARD',
        details: { cardTitle: card1.title },
        boardId: board.id,
        cardId: card1.id,
        userId: demoUser.id,
      },
      {
        action: 'MOVED_CARD',
        details: { cardTitle: card2.title, from: 'To Do', to: 'In Progress' },
        boardId: board.id,
        cardId: card2.id,
        userId: demoUser.id,
      },
    ],
  });

  console.log('Trello Clone seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

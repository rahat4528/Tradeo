import { PrismaClient, Priority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Kanban Board database...');

  await prisma.card.deleteMany({});
  await prisma.swimlane.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@tradeo.io',
      password: hashedPassword,
      name: 'Morgan Davis',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
  });

  const board = await prisma.board.create({
    data: {
      title: 'Platform Infrastructure Flow',
      description: 'Zero-downtime distributed systems and continuous deployment pipeline.',
      ownerId: user.id,
    },
  });

  // Swimlanes
  const expedite = await prisma.swimlane.create({
    data: {
      boardId: board.id,
      title: 'Expedite (Severity-1)',
      order: 0,
    },
  });

  const standard = await prisma.swimlane.create({
    data: {
      boardId: board.id,
      title: 'Standard Work',
      order: 1,
    },
  });

  // Columns with WIP limits & policies
  const colReady = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'Ready for Dev',
      order: 0,
      wipLimit: 8,
      policy: 'Items must have documented acceptance criteria and reviewed architectural impact.',
    },
  });

  const colDoing = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'In Development',
      order: 1,
      wipLimit: 3,
      policy: 'Pair-programming or single active branch per engineer. Maximum 3 concurrent items.',
    },
  });

  const colReview = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'Code & QA Review',
      order: 2,
      wipLimit: 2,
      policy: 'Two peer approvals and green CI test pipeline required before merge.',
    },
  });

  const colDone = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'Shipped to Prod',
      order: 3,
      isTerminal: true,
      policy: 'Automated canary verification passes with zero elevated error rates.',
    },
  });

  // Sample cards
  const now = new Date();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  // Blocked card in Development
  await prisma.card.create({
    data: {
      boardId: board.id,
      columnId: colDoing.id,
      swimlaneId: standard.id,
      title: 'TLS cert rotation across internal service mesh',
      description: 'Update Envoy ingress proxies with 2026 root CA bundle.',
      priority: Priority.HIGH,
      size: 'M',
      position: 1000,
      isBlocked: true,
      blockReason: 'Awaiting vendor KMS access token grant from security team.',
      startedAt: twoDaysAgo,
      enteredColumnAt: twoDaysAgo,
      createdAt: fiveDaysAgo,
      assigneeId: user.id,
    },
  });

  // Expedite card
  await prisma.card.create({
    data: {
      boardId: board.id,
      columnId: colDoing.id,
      swimlaneId: expedite.id,
      title: 'Mitigate DDoS spike on EU edge node',
      description: 'Apply rate limiting rule on /api/auth/token endpoint.',
      priority: Priority.URGENT,
      size: 'S',
      position: 500,
      startedAt: now,
      enteredColumnAt: now,
      createdAt: now,
      assigneeId: user.id,
    },
  });

  // Ready card
  await prisma.card.create({
    data: {
      boardId: board.id,
      columnId: colReady.id,
      swimlaneId: standard.id,
      title: 'Optimize Redis cache cluster eviction policy',
      description: 'Switch from LRU to LFU for market ticker snapshot buffers.',
      priority: Priority.MEDIUM,
      size: 'L',
      position: 2000,
      createdAt: twoDaysAgo,
    },
  });

  // Completed card
  await prisma.card.create({
    data: {
      boardId: board.id,
      columnId: colDone.id,
      swimlaneId: standard.id,
      title: 'Upgrade Kubernetes worker nodes to v1.29',
      description: 'Rolled out across all primary AZ node groups without disruption.',
      priority: Priority.HIGH,
      size: 'XL',
      position: 3000,
      startedAt: fiveDaysAgo,
      completedAt: twoDaysAgo,
      createdAt: fiveDaysAgo,
      assigneeId: user.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

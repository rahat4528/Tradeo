import { PrismaClient, IssueType, IssuePriority, SprintStatus, StateCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Jira Clone database...');

  await prisma.comment.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.sprint.deleteMany({});
  await prisma.workflowState.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@tradeo.io',
      password: hashedPassword,
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'sarah.engineer@tradeo.io',
      password: hashedPassword,
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Tradeo Core Engine',
      key: 'ENG',
      description: 'Distributed microservices architecture and core transaction settlement pipeline.',
      ownerId: demoUser.id,
      issueCounter: 6,
    },
  });

  // Default workflow states
  const states = [
    { name: 'Backlog', category: StateCategory.TODO, order: 0, isDefault: true },
    { name: 'To Do', category: StateCategory.TODO, order: 1, isDefault: false },
    { name: 'In Progress', category: StateCategory.IN_PROGRESS, order: 2, isDefault: false },
    { name: 'In Review', category: StateCategory.IN_PROGRESS, order: 3, isDefault: false },
    { name: 'Done', category: StateCategory.DONE, order: 4, isDefault: false },
  ];

  const createdStates: Record<string, any> = {};
  for (const s of states) {
    createdStates[s.name] = await prisma.workflowState.create({
      data: {
        projectId: project.id,
        name: s.name,
        category: s.category,
        order: s.order,
        isDefault: s.isDefault,
      },
    });
  }

  // Active Sprint
  const activeSprint = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: 'Sprint 24: Core Reliability',
      goal: 'Achieve zero socket dropouts under 10k RPS load and streamline order fulfillment.',
      status: SprintStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Future Sprint
  const futureSprint = await prisma.sprint.create({
    data: {
      projectId: project.id,
      name: 'Sprint 25: Liquidity Pools',
      goal: 'Automate multi-exchange hedging and liquidity distribution.',
      status: SprintStatus.FUTURE,
      startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    },
  });

  // Epic
  const epic = await prisma.issue.create({
    data: {
      key: 'ENG-1',
      projectId: project.id,
      title: 'High-Throughput Order Book Redesign',
      description: 'Modernize in-memory order matching engine to sub-millisecond latencies.',
      type: IssueType.EPIC,
      priority: IssuePriority.HIGHEST,
      statusId: createdStates['In Progress'].id,
      reporterId: demoUser.id,
      assigneeId: demoUser.id,
      storyPoints: 21,
      position: 1000,
    },
  });

  // Issues in Active Sprint
  await prisma.issue.create({
    data: {
      key: 'ENG-2',
      projectId: project.id,
      sprintId: activeSprint.id,
      parentId: epic.id,
      title: 'Implement Redis lock cluster for account balances',
      description: 'Prevent race conditions when parallel trade orders attempt balance deductions.',
      type: IssueType.STORY,
      priority: IssuePriority.HIGH,
      statusId: createdStates['In Progress'].id,
      reporterId: demoUser.id,
      assigneeId: memberUser.id,
      storyPoints: 5,
      position: 2000,
    },
  });

  await prisma.issue.create({
    data: {
      key: 'ENG-3',
      projectId: project.id,
      sprintId: activeSprint.id,
      title: 'Fix unhandled WebSocket reconnect timeout',
      description: 'Clients fail to auto-reconnect when load balancer closes idle connections.',
      type: IssueType.BUG,
      priority: IssuePriority.HIGHEST,
      statusId: createdStates['To Do'].id,
      reporterId: memberUser.id,
      assigneeId: demoUser.id,
      storyPoints: 3,
      position: 3000,
    },
  });

  await prisma.issue.create({
    data: {
      key: 'ENG-4',
      projectId: project.id,
      sprintId: activeSprint.id,
      title: 'Migrate audit logs to timeseries partition',
      description: 'Improve analytical queries on user execution traces.',
      type: IssueType.TASK,
      priority: IssuePriority.MEDIUM,
      statusId: createdStates['Done'].id,
      reporterId: demoUser.id,
      assigneeId: memberUser.id,
      storyPoints: 8,
      position: 4000,
    },
  });

  // Issues in Backlog
  await prisma.issue.create({
    data: {
      key: 'ENG-5',
      projectId: project.id,
      title: 'Automated smart order routing prototype',
      description: 'Explore shortest-path split orders across external DEX liquidity pools.',
      type: IssueType.STORY,
      priority: IssuePriority.LOW,
      statusId: createdStates['Backlog'].id,
      reporterId: demoUser.id,
      storyPoints: 13,
      position: 5000,
    },
  });

  await prisma.issue.create({
    data: {
      key: 'ENG-6',
      projectId: project.id,
      sprintId: futureSprint.id,
      title: 'Security audit on API key HMAC signatures',
      description: 'Verify constant-time comparison prevents timing analysis vulnerabilities.',
      type: IssueType.TASK,
      priority: IssuePriority.HIGH,
      statusId: createdStates['To Do'].id,
      reporterId: memberUser.id,
      assigneeId: demoUser.id,
      storyPoints: 5,
      position: 6000,
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

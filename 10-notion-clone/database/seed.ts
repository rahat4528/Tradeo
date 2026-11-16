import { PrismaClient, BlockType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Notion Clone database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'writer@example.com' },
    update: {},
    create: {
      email: 'writer@example.com',
      passwordHash,
      name: 'Chief Knowledge Officer',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: 'default-notion-workspace-uuid' },
    update: {},
    create: {
      id: 'default-notion-workspace-uuid',
      name: 'Engineering Handbook',
      ownerId: demoUser.id,
    },
  });

  const parentPage = await prisma.page.create({
    data: {
      title: 'Company Engineering Playbook',
      icon: '🚀',
      coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
      isFavorite: true,
      workspaceId: workspace.id,
      authorId: demoUser.id,
      blocks: {
        create: [
          {
            type: BlockType.HEADING_1,
            content: 'Architecture & System Principles',
            position: 1000.0,
          },
          {
            type: BlockType.CALLOUT,
            content: 'All 13 Tradeo applications operate under strict isolation standards with dedicated schemas.',
            properties: { icon: '💡' },
            position: 2000.0,
          },
          {
            type: BlockType.PARAGRAPH,
            content: 'Our core philosophy prioritizes type safety, deterministic reproducible builds, and 100% test pass verification.',
            position: 3000.0,
          },
          {
            type: BlockType.TODO_LIST,
            content: 'Configure independent environment variables for microservices',
            properties: { checked: true },
            position: 4000.0,
          },
          {
            type: BlockType.TODO_LIST,
            content: 'Run automated end-to-end regression suites before phase gate sign-off',
            properties: { checked: true },
            position: 5000.0,
          },
          {
            type: BlockType.CODE_BLOCK,
            content: 'export const TRADE_ENV = "production";\nconsole.log(`Starting isolated service node...`);',
            properties: { language: 'typescript' },
            position: 6000.0,
          },
        ],
      },
    },
  });

  await prisma.page.create({
    data: {
      title: 'Coding Standards & Style Guide',
      icon: '📖',
      parentId: parentPage.id,
      workspaceId: workspace.id,
      authorId: demoUser.id,
      blocks: {
        create: [
          {
            type: BlockType.HEADING_2,
            content: 'TypeScript Best Practices',
            position: 1000.0,
          },
          {
            type: BlockType.BULLET_LIST,
            content: 'Avoid loose any casting where possible; use domain-specific types.',
            position: 2000.0,
          },
          {
            type: BlockType.BULLET_LIST,
            content: 'Always define clear NestJS DTO validation pipes with class-validator.',
            position: 3000.0,
          },
        ],
      },
    },
  });

  console.log('Notion Clone seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

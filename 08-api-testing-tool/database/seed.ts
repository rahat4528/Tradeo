import { PrismaClient, HttpMethod, BodyType, AuthType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding API Testing Tool database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    update: {},
    create: {
      email: 'developer@example.com',
      passwordHash,
      name: 'Lead API Engineer',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { id: 'default-workspace-uuid' },
    update: {},
    create: {
      id: 'default-workspace-uuid',
      name: 'Primary API Workspace',
      description: 'Default testing workspace for microservices and third-party APIs',
      ownerId: demoUser.id,
    },
  });

  const stagingEnv = await prisma.environment.create({
    data: {
      name: 'Staging Environment',
      workspaceId: workspace.id,
      isDefault: true,
      variables: [
        { key: 'baseUrl', value: 'https://httpbin.org', isSecret: false },
        { key: 'apiKey', value: 'staging-key-secret-999', isSecret: true },
        { key: 'userId', value: 'user_4492', isSecret: false },
      ],
    },
  });

  const collection = await prisma.collection.create({
    data: {
      name: 'HTTP Testing Suite',
      description: 'Standard HTTP method verification and response validation',
      workspaceId: workspace.id,
    },
  });

  await prisma.savedRequest.createMany({
    data: [
      {
        name: 'Get Sample IP',
        method: HttpMethod.GET,
        url: '{{baseUrl}}/ip',
        headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        collectionId: collection.id,
        workspaceId: workspace.id,
        assertions: [
          { type: 'STATUS_EQUALS', target: '200' },
          { type: 'RESPONSE_TIME_LT', target: '1000' },
        ],
      },
      {
        name: 'Create User Payload',
        method: HttpMethod.POST,
        url: '{{baseUrl}}/post',
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        body: JSON.stringify({ username: 'john_doe', role: 'admin' }, null, 2),
        bodyType: BodyType.JSON,
        collectionId: collection.id,
        workspaceId: workspace.id,
        assertions: [
          { type: 'STATUS_EQUALS', target: '200' },
          { type: 'JSON_BODY_CONTAINS', target: 'json' },
        ],
      },
    ],
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

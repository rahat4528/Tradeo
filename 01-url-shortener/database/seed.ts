import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for 01-url-shortener...');

  // Clean existing records if any
  await prisma.click.deleteMany({});
  await prisma.link.deleteMany({});
  await prisma.domain.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Admin123!@#', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@tradeo.local',
      name: 'Demo Architect',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const domain = await prisma.domain.create({
    data: {
      domain: 's.tradeo.io',
      fallbackUrl: 'https://tradeo.io',
      isVerified: true,
      userId: demoUser.id,
    },
  });

  const link1 = await prisma.link.create({
    data: {
      slug: 'docs-2026',
      targetUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      description: 'Standard JavaScript Reference',
      isActive: true,
      redirectCode: 307,
      userId: demoUser.id,
      domainId: domain.id,
      clickCount: 5,
    },
  });

  const link2 = await prisma.link.create({
    data: {
      slug: 'github-repo',
      targetUrl: 'https://github.com',
      description: 'Official Code Repository',
      isActive: true,
      redirectCode: 301,
      userId: demoUser.id,
      clickCount: 3,
    },
  });

  // Seed clicks
  const referrers = ['https://google.com', 'https://twitter.com', 'https://linkedin.com', 'Direct'];
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const osList = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
  const countries = ['US', 'DE', 'GB', 'CA', 'FR', 'JP'];

  for (let i = 0; i < 8; i++) {
    await prisma.click.create({
      data: {
        linkId: i % 2 === 0 ? link1.id : link2.id,
        timestamp: new Date(Date.now() - i * 3600 * 1000 * 4),
        ipHash: `hash-${i}`,
        country: countries[i % countries.length],
        referrer: referrers[i % referrers.length],
        browser: browsers[i % browsers.length],
        os: osList[i % osList.length],
        device: i % 3 === 0 ? 'Mobile' : 'Desktop',
        isUnique: i < 5,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

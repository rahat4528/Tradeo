import { PrismaClient, LocationType, BookingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 6 Calendar Scheduling Database...');

  const passwordHash = await bcrypt.hash('HostPassword123!', 10);

  const hostUser = await prisma.user.upsert({
    where: { email: 'alex@timesync.io' },
    update: {},
    create: {
      username: 'alex-consultant',
      email: 'alex@timesync.io',
      passwordHash,
      name: 'Alex Mercer',
      timezone: 'America/New_York',
      bio: 'Enterprise Architecture & Cloud Strategy Advisor',
    },
  });

  // Default weekly schedules: Monday (1) to Friday (5), 09:00 - 17:00
  for (let day = 1; day <= 5; day++) {
    await prisma.schedule.create({
      data: {
        userId: hostUser.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  }

  // Create event types
  const quickChat = await prisma.eventType.create({
    data: {
      userId: hostUser.id,
      title: '15 Min Quick Intro',
      slug: 'quick-intro',
      description: 'Short synchronous catch-up to explore mutual collaboration.',
      durationMinutes: 15,
      locationType: LocationType.GOOGLE_MEET,
      bufferBefore: 5,
      bufferAfter: 5,
      isActive: true,
    },
  });

  const deepDive = await prisma.eventType.create({
    data: {
      userId: hostUser.id,
      title: '45 Min Strategy Advisory',
      slug: 'strategy-advisory',
      description: 'In-depth technology roadmap review and strategic alignment.',
      durationMinutes: 45,
      locationType: LocationType.ZOOM,
      bufferBefore: 10,
      bufferAfter: 15,
      isActive: true,
    },
  });

  console.log(`Seeded host user: ${hostUser.email} (slug: /book/${hostUser.username})`);
  console.log(`Created event types: ${quickChat.slug}, ${deepDive.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

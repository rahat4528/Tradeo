import { PrismaClient, UserRole, CompanyTier, DealStage, ActivityType, Priority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 7 CRM Database...');

  const org = await prisma.organization.create({
    data: {
      name: 'Vanguard Global Solutions',
      currency: 'USD',
    },
  });

  const managerPass = await bcrypt.hash('ManagerPass123!', 10);
  const repPass = await bcrypt.hash('SalesRepPass123!', 10);

  const manager = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'manager@vanguard.com',
      passwordHash: managerPass,
      name: 'Victoria Stone',
      role: UserRole.MANAGER,
    },
  });

  const rep = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'rep@vanguard.com',
      passwordHash: repPass,
      name: 'Ethan Hunt',
      role: UserRole.SALES_REP,
    },
  });

  const companyA = await prisma.company.create({
    data: {
      organizationId: org.id,
      ownerId: rep.id,
      name: 'Acme Robotics Corp',
      domain: 'acmerobotics.io',
      industry: 'Industrial Automation',
      annualRevenue: 12500000,
      tier: CompanyTier.ENTERPRISE,
    },
  });

  const contactA = await prisma.contact.create({
    data: {
      organizationId: org.id,
      companyId: companyA.id,
      ownerId: rep.id,
      firstName: 'Samantha',
      lastName: 'Reed',
      email: 'samantha@acmerobotics.io',
      phone: '+1 (415) 555-0182',
      title: 'VP of Manufacturing',
      leadSource: 'Executive Referral',
    },
  });

  const dealA = await prisma.deal.create({
    data: {
      organizationId: org.id,
      companyId: companyA.id,
      contactId: contactA.id,
      ownerId: rep.id,
      title: 'Enterprise Fleet Automation License',
      value: 120000,
      stage: DealStage.PROPOSAL,
      probability: 50,
      closeDate: new Date('2026-12-15'),
    },
  });

  await prisma.activity.create({
    data: {
      organizationId: org.id,
      userId: rep.id,
      companyId: companyA.id,
      contactId: contactA.id,
      dealId: dealA.id,
      type: ActivityType.MEETING,
      title: 'Architecture Review Meeting',
      body: 'Presented 12-month automation roadmap to Samantha and VP of Engineering. Received positive feedback.',
    },
  });

  await prisma.task.create({
    data: {
      organizationId: org.id,
      userId: rep.id,
      dealId: dealA.id,
      title: 'Deliver formal RFP security questionnaire',
      dueDate: new Date('2026-11-25'),
      priority: Priority.HIGH,
    },
  });

  console.log(`Seeded organization: ${org.name} with manager ${manager.email} and rep ${rep.email}`);
  console.log(`Created sample deal: ${dealA.title} ($${dealA.value})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

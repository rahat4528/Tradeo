import { ActivitiesService } from '../../backend/src/modules/activities/activities.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ActivityType, Priority } from '@prisma/client';

describe('ActivitiesService (API / Contract Tests)', () => {
  let service: ActivitiesService;
  let prisma: MockPrismaService;
  const orgId = 'org-crm-activities';
  const userId = 'usr-rep-act';

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new ActivitiesService(prisma as any);
  });

  it('logs customer interaction activities on timeline', async () => {
    const act = await service.createActivity(orgId, userId, {
      type: ActivityType.CALL,
      title: 'Discovery Phone Call',
      body: 'Discussed renewal terms and added 50 seat expansion.',
      dealId: 'deal-101',
    });

    expect(act.type).toBe(ActivityType.CALL);
    expect(act.title).toBe('Discovery Phone Call');

    const timeline = await service.getActivities(orgId, { dealId: 'deal-101' });
    expect(timeline.length).toBe(1);
  });

  it('creates follow-up task and toggles completion', async () => {
    const task = await service.createTask(orgId, userId, {
      title: 'Send quote by Friday EOD',
      dueDate: '2026-11-20',
      priority: Priority.HIGH,
      dealId: 'deal-101',
    });

    expect(task.isCompleted).toBe(false);

    const toggled = await service.toggleTaskCompletion(task.id, orgId);
    expect(toggled.isCompleted).toBe(true);
  });
});

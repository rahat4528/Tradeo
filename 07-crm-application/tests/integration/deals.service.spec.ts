import { DealsService } from '../../backend/src/modules/deals/deals.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { DealStage } from '@prisma/client';

describe('DealsService (Integration)', () => {
  let service: DealsService;
  let prisma: MockPrismaService;
  const orgId = 'org-crm-deals';
  const ownerId = 'usr-rep-1';

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new DealsService(prisma as any);
  });

  it('creates deal opportunity with automatic stage probability assignment', async () => {
    const deal = await service.create(orgId, ownerId, {
      title: 'Global Cloud Infrastructure Migration',
      value: 150000,
      stage: DealStage.PROPOSAL,
    });

    expect(deal.title).toBe('Global Cloud Infrastructure Migration');
    expect(deal.value).toBe(150000);
    expect(deal.stage).toBe(DealStage.PROPOSAL);
    expect(deal.probability).toBe(50);
  });

  it('advances deal stage and recalculates probability', async () => {
    const deal = await service.create(orgId, ownerId, {
      title: 'Security Compliance Audit',
      value: 80000,
      stage: DealStage.LEAD,
    });
    expect(deal.probability).toBe(10);

    const advanced = await service.updateStage(deal.id, orgId, {
      stage: DealStage.NEGOTIATION,
    });

    expect(advanced.stage).toBe(DealStage.NEGOTIATION);
    expect(advanced.probability).toBe(75);
  });

  it('generates grouped pipeline columns with totals', async () => {
    await service.create(orgId, ownerId, {
      title: 'Deal 1',
      value: 50000,
      stage: DealStage.QUALIFIED, // 25%
    });
    await service.create(orgId, ownerId, {
      title: 'Deal 2',
      value: 100000,
      stage: DealStage.PROPOSAL, // 50%
    });

    const pipeline = await service.findPipelineGrouped(orgId);
    expect(pipeline.grandTotal).toBe(150000);
    expect(pipeline.weightedForecast).toBe(12500 + 50000); // 62,500
    expect(pipeline.columns.length).toBe(6);
  });
});

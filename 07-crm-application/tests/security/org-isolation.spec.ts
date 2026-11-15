import { CompaniesService } from '../../backend/src/modules/companies/companies.service';
import { DealsService } from '../../backend/src/modules/deals/deals.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DealStage } from '@prisma/client';

describe('CRM Security Tests - Multi-Tenant Isolation', () => {
  let companiesService: CompaniesService;
  let dealsService: DealsService;
  let prisma: MockPrismaService;

  const orgA = 'org-crm-alpha';
  const orgB = 'org-crm-beta';

  beforeEach(async () => {
    prisma = new MockPrismaService();
    companiesService = new CompaniesService(prisma as any);
    dealsService = new DealsService(prisma as any);

    // Org A setup
    await prisma.company.create({
      data: { id: 'comp-alpha', organizationId: orgA, name: 'Alpha Secret Client' },
    });
    await prisma.deal.create({
      data: { id: 'deal-alpha', organizationId: orgA, title: 'Secret Alpha Merger Deal', value: 5000000, stage: DealStage.NEGOTIATION },
    });

    // Org B setup
    await prisma.company.create({
      data: { id: 'comp-beta', organizationId: orgB, name: 'Beta Standard Client' },
    });
    await prisma.deal.create({
      data: { id: 'deal-beta', organizationId: orgB, title: 'Standard Beta Sale', value: 20000, stage: DealStage.QUALIFIED },
    });
  });

  it('prevents Org B from accessing Org A company record', async () => {
    await expect(
      companiesService.findOne('comp-alpha', orgB),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents Org B from modifying Org A deal stage', async () => {
    await expect(
      dealsService.updateStage('deal-alpha', orgB, { stage: DealStage.CLOSED_WON }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('ensures pipeline grouped query strictly isolates deals by organization', async () => {
    const pipelineB = await dealsService.findPipelineGrouped(orgB);
    expect(pipelineB.grandTotal).toBe(20000); // Only Beta's deal, Alpha's $5M deal is not leaked!

    const pipelineA = await dealsService.findPipelineGrouped(orgA);
    expect(pipelineA.grandTotal).toBe(5000000);
  });
});

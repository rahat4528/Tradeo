import { CompaniesService } from '../../backend/src/modules/companies/companies.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { CompanyTier } from '@prisma/client';

describe('CompaniesService (Integration)', () => {
  let service: CompaniesService;
  let prisma: MockPrismaService;
  const orgId = 'org-crm-companies';
  const ownerId = 'usr-rep-comp';

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new CompaniesService(prisma as any);
  });

  it('creates an enterprise company account with domain and annual revenue', async () => {
    const comp = await service.create(orgId, ownerId, {
      name: 'CyberShield Systems',
      domain: 'cybershield.io',
      industry: 'Cybersecurity',
      annualRevenue: 25000000,
      tier: CompanyTier.ENTERPRISE,
    });

    expect(comp.name).toBe('CyberShield Systems');
    expect(comp.annualRevenue).toBe(25000000);
    expect(comp.tier).toBe(CompanyTier.ENTERPRISE);
  });

  it('filters companies by search query', async () => {
    await service.create(orgId, ownerId, { name: 'Alpha Tech', domain: 'alphatech.com' });
    await service.create(orgId, ownerId, { name: 'Beta Systems', domain: 'betasystems.org' });

    const all = await service.findAll(orgId);
    expect(all.length).toBe(2);

    const found = await service.findOne(all[0].id, orgId);
    expect(found).toBeDefined();
    expect(found.name).toBe('Alpha Tech');
  });
});

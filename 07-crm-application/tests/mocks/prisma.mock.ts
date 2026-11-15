export class MockPrismaService {
  public organizations: any[] = [];
  public users: any[] = [];
  public companies: any[] = [];
  public contacts: any[] = [];
  public deals: any[] = [];
  public activities: any[] = [];
  public tasks: any[] = [];

  organization = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const org = { id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.organizations.push(org);
      return org;
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.organizations.find(o => o.id === where.id) || null;
    }),
  };

  user = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const u = { id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.users.push(u);
      return u;
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.email) return this.users.find(u => u.email === where.email) || null;
      if (where.id) return this.users.find(u => u.id === where.id) || null;
      return null;
    }),
  };

  company = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const c = { id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.companies.push(c);
      return c;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.companies.filter(c => !where || !where.organizationId || c.organizationId === where.organizationId);
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.companies.find(c => c.id === where.id) || null;
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.companies.findIndex(c => c.id === where.id);
      if (idx === -1) return null;
      this.companies[idx] = { ...this.companies[idx], ...data, updatedAt: new Date() };
      return this.companies[idx];
    }),
    delete: jest.fn().mockImplementation(async ({ where }) => {
      const idx = this.companies.findIndex(c => c.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.companies.splice(idx, 1);
      return removed;
    }),
  };

  contact = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const ct = { id: `ct-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.contacts.push(ct);
      return ct;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.contacts.filter(c => !where || !where.organizationId || c.organizationId === where.organizationId);
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.contacts.find(c => c.id === where.id) || null;
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.contacts.findIndex(c => c.id === where.id);
      if (idx === -1) return null;
      this.contacts[idx] = { ...this.contacts[idx], ...data, updatedAt: new Date() };
      return this.contacts[idx];
    }),
    delete: jest.fn().mockImplementation(async ({ where }) => {
      const idx = this.contacts.findIndex(c => c.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.contacts.splice(idx, 1);
      return removed;
    }),
  };

  deal = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const d = {
        id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: this.companies.find(c => c.id === data.companyId) || null,
        contact: this.contacts.find(ct => ct.id === data.contactId) || null,
        owner: this.users.find(u => u.id === data.ownerId) || null,
      };
      this.deals.push(d);
      return d;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.deals
        .filter(d => {
          if (where?.organizationId && d.organizationId !== where.organizationId) return false;
          if (where?.stage && d.stage !== where.stage) return false;
          if (where?.ownerId && d.ownerId !== where.ownerId) return false;
          return true;
        })
        .map(d => ({
          ...d,
          company: this.companies.find(c => c.id === d.companyId) || null,
          contact: this.contacts.find(ct => ct.id === d.contactId) || null,
          owner: this.users.find(u => u.id === d.ownerId) || null,
        }));
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      const d = this.deals.find(deal => deal.id === where.id);
      if (!d) return null;
      return {
        ...d,
        company: this.companies.find(c => c.id === d.companyId) || null,
        contact: this.contacts.find(ct => ct.id === d.contactId) || null,
        owner: this.users.find(u => u.id === d.ownerId) || null,
      };
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.deals.findIndex(d => d.id === where.id);
      if (idx === -1) return null;
      this.deals[idx] = { ...this.deals[idx], ...data, updatedAt: new Date() };
      return {
        ...this.deals[idx],
        company: this.companies.find(c => c.id === this.deals[idx].companyId) || null,
        contact: this.contacts.find(ct => ct.id === this.deals[idx].contactId) || null,
      };
    }),
    delete: jest.fn().mockImplementation(async ({ where }) => {
      const idx = this.deals.findIndex(d => d.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.deals.splice(idx, 1);
      return removed;
    }),
  };

  activity = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const act = { id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date() };
      this.activities.push(act);
      return act;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.activities.filter(a => {
        if (where?.organizationId && a.organizationId !== where.organizationId) return false;
        if (where?.dealId && a.dealId !== where.dealId) return false;
        if (where?.companyId && a.companyId !== where.companyId) return false;
        return true;
      });
    }),
  };

  task = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const t = { id: `tsk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, isCompleted: false, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.tasks.push(t);
      return t;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.tasks.filter(t => !where || !where.organizationId || t.organizationId === where.organizationId);
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.tasks.find(t => t.id === where.id) || null;
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.tasks.findIndex(t => t.id === where.id);
      if (idx === -1) return null;
      this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date() };
      return this.tasks[idx];
    }),
  };
}

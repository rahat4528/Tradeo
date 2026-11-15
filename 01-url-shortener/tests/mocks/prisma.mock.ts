export class MockPrismaService {
  private users: any[] = [];
  private links: any[] = [];
  private clicks: any[] = [];
  private domains: any[] = [];
  private apiKeys: any[] = [];

  user = {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.id) return this.users.find((u) => u.id === where.id) || null;
      if (where.email) return this.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      return null;
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      return this.users.find((u) => (!where.email || u.email === where.email)) || null;
    }),
    create: jest.fn(async ({ data }: any) => {
      const newUser = {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.users.push(newUser);
      return newUser;
    }),
  };

  link = {
    findUnique: jest.fn(async ({ where }: any) => {
      if (where.id) return this.links.find((l) => l.id === where.id) || null;
      if (where.slug) return this.links.find((l) => l.slug === where.slug) || null;
      return null;
    }),
    findMany: jest.fn(async ({ where, skip = 0, take = 50 }: any) => {
      let filtered = [...this.links];
      if (where?.userId) filtered = filtered.filter((l) => l.userId === where.userId);
      if (where?.OR) {
        filtered = filtered.filter((l) => {
          const s = where.OR[0]?.slug?.contains?.toLowerCase();
          if (!s) return true;
          return (
            l.slug.toLowerCase().includes(s) ||
            l.targetUrl.toLowerCase().includes(s) ||
            (l.description && l.description.toLowerCase().includes(s))
          );
        });
      }
      return filtered.slice(skip, skip + take);
    }),
    count: jest.fn(async ({ where }: any) => {
      let filtered = [...this.links];
      if (where?.userId) filtered = filtered.filter((l) => l.userId === where.userId);
      return filtered.length;
    }),
    create: jest.fn(async ({ data }: any) => {
      const newLink = {
        id: `link-${Date.now()}-${Math.random()}`,
        clickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        domain: null,
        ...data,
      };
      this.links.push(newLink);
      return newLink;
    }),
    update: jest.fn(async ({ where, data }: any) => {
      const index = this.links.findIndex((l) => l.id === where.id);
      if (index === -1) throw new Error('Link not found');
      if (data.clickCount?.increment) {
        this.links[index].clickCount += data.clickCount.increment;
        delete data.clickCount;
      }
      this.links[index] = { ...this.links[index], ...data, updatedAt: new Date() };
      return this.links[index];
    }),
    delete: jest.fn(async ({ where }: any) => {
      const index = this.links.findIndex((l) => l.id === where.id);
      if (index === -1) throw new Error('Link not found');
      const deleted = this.links.splice(index, 1)[0];
      return deleted;
    }),
  };

  click = {
    create: jest.fn(async ({ data }: any) => {
      const newClick = {
        id: `click-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        ...data,
      };
      this.clicks.push(newClick);
      return newClick;
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      return (
        this.clicks.find(
          (c) =>
            c.linkId === where.linkId &&
            c.ipHash === where.ipHash &&
            (!where.timestamp?.gte || c.timestamp >= where.timestamp.gte),
        ) || null
      );
    }),
    findMany: jest.fn(async ({ where }: any) => {
      let filtered = [...this.clicks];
      if (where?.linkId) {
        if (typeof where.linkId === 'string') {
          filtered = filtered.filter((c) => c.linkId === where.linkId);
        } else if (where.linkId.in) {
          filtered = filtered.filter((c) => where.linkId.in.includes(c.linkId));
        }
      }
      if (where?.timestamp?.gte) {
        filtered = filtered.filter((c) => c.timestamp >= where.timestamp.gte);
      }
      return filtered;
    }),
  };

  domain = {
    findUnique: jest.fn(async ({ where }: any) => {
      return this.domains.find((d) => d.id === where.id || d.domain === where.domain) || null;
    }),
    findFirst: jest.fn(async ({ where }: any) => {
      return this.domains.find((d) => (!where.id || d.id === where.id) && (!where.userId || d.userId === where.userId)) || null;
    }),
    findMany: jest.fn(async ({ where }: any) => {
      let filtered = [...this.domains];
      if (where?.userId) filtered = filtered.filter((d) => d.userId === where.userId);
      return filtered;
    }),
    create: jest.fn(async ({ data }: any) => {
      const newDomain = {
        id: `domain-${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.domains.push(newDomain);
      return newDomain;
    }),
    delete: jest.fn(async ({ where }: any) => {
      const index = this.domains.findIndex((d) => d.id === where.id);
      if (index === -1) throw new Error('Domain not found');
      return this.domains.splice(index, 1)[0];
    }),
  };

  reset() {
    this.users = [];
    this.links = [];
    this.clicks = [];
    this.domains = [];
    this.apiKeys = [];
  }
}

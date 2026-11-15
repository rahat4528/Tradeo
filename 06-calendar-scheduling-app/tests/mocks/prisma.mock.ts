export class MockPrismaService {
  public users: any[] = [];
  public eventTypes: any[] = [];
  public schedules: any[] = [];
  public dateOverrides: any[] = [];
  public bookings: any[] = [];

  user = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const u = { id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.users.push(u);
      return u;
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.email) return this.users.find(u => u.email === where.email) || null;
      if (where.username) return this.users.find(u => u.username === where.username) || null;
      if (where.id) return this.users.find(u => u.id === where.id) || null;
      return null;
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.users.findIndex(u => u.id === where.id);
      if (idx === -1) return null;
      this.users[idx] = { ...this.users[idx], ...data, updatedAt: new Date() };
      return this.users[idx];
    }),
  };

  eventType = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const et = { id: `et-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.eventTypes.push(et);
      return et;
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.userId_slug) {
        return this.eventTypes.find(et => et.userId === where.userId_slug.userId && et.slug === where.userId_slug.slug) || null;
      }
      return this.eventTypes.find(et => et.id === where.id) || null;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.eventTypes.filter(et => !where || !where.userId || et.userId === where.userId);
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.eventTypes.findIndex(et => et.id === where.id);
      if (idx === -1) return null;
      this.eventTypes[idx] = { ...this.eventTypes[idx], ...data, updatedAt: new Date() };
      return this.eventTypes[idx];
    }),
    delete: jest.fn().mockImplementation(async ({ where }) => {
      const idx = this.eventTypes.findIndex(et => et.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.eventTypes.splice(idx, 1);
      return removed;
    }),
  };

  schedule = {
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.schedules.filter(s => {
        if (where?.userId && s.userId !== where.userId) return false;
        if (where?.dayOfWeek !== undefined && s.dayOfWeek !== where.dayOfWeek) return false;
        return true;
      });
    }),
    create: jest.fn().mockImplementation(async ({ data }) => {
      const s = { id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.schedules.push(s);
      return s;
    }),
    createMany: jest.fn().mockImplementation(async ({ data }) => {
      for (const item of data) {
        this.schedules.push({ id: `sch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...item, createdAt: new Date(), updatedAt: new Date() });
      }
      return { count: data.length };
    }),
    deleteMany: jest.fn().mockImplementation(async ({ where }) => {
      const before = this.schedules.length;
      this.schedules = this.schedules.filter(s => where?.userId && s.userId !== where.userId);
      return { count: before - this.schedules.length };
    }),
  };

  dateOverride = {
    findFirst: jest.fn().mockImplementation(async ({ where }) => {
      return this.dateOverrides.find(o => {
        if (where?.userId && o.userId !== where.userId) return false;
        if (where?.date && o.date !== where.date) return false;
        return true;
      }) || null;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.dateOverrides.filter(o => !where || !where.userId || o.userId === where.userId);
    }),
    create: jest.fn().mockImplementation(async ({ data }) => {
      const o = { id: `ovr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.dateOverrides.push(o);
      return o;
    }),
    deleteMany: jest.fn().mockImplementation(async ({ where }) => {
      const before = this.dateOverrides.length;
      this.dateOverrides = this.dateOverrides.filter(o => !(where?.userId === o.userId && where?.date === o.date));
      return { count: before - this.dateOverrides.length };
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.dateOverrides.find(o => o.id === where.id) || null;
    }),
    delete: jest.fn().mockImplementation(async ({ where }) => {
      const idx = this.dateOverrides.findIndex(o => o.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.dateOverrides.splice(idx, 1);
      return removed;
    }),
  };

  booking = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const b = {
        id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        uid: `uid-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        eventType: this.eventTypes.find(et => et.id === data.eventTypeId),
        user: this.users.find(u => u.id === data.userId),
      };
      this.bookings.push(b);
      return b;
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.uid) {
        const b = this.bookings.find(bk => bk.uid === where.uid);
        if (!b) return null;
        return {
          ...b,
          eventType: this.eventTypes.find(et => et.id === b.eventTypeId),
          user: this.users.find(u => u.id === b.userId),
        };
      }
      const b = this.bookings.find(bk => bk.id === where.id);
      if (!b) return null;
      return {
        ...b,
        eventType: this.eventTypes.find(et => et.id === b.eventTypeId),
        user: this.users.find(u => u.id === b.userId),
      };
    }),
    findFirst: jest.fn().mockImplementation(async ({ where }) => {
      return this.bookings.find(b => {
        if (where?.userId && b.userId !== where.userId) return false;
        if (where?.status && b.status !== where.status) return false;
        if (where?.id?.not && b.id === where.id.not) return false;
        if (where?.startTime?.lt && !(b.startTime < where.startTime.lt)) return false;
        if (where?.endTime?.gt && !(b.endTime > where.endTime.gt)) return false;
        return true;
      }) || null;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.bookings
        .filter(b => {
          if (where?.userId && b.userId !== where.userId) return false;
          if (where?.status && b.status !== where.status) return false;
          return true;
        })
        .map(b => ({
          ...b,
          eventType: this.eventTypes.find(et => et.id === b.eventTypeId),
          user: this.users.find(u => u.id === b.userId),
        }));
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.bookings.findIndex(b => (where.id && b.id === where.id) || (where.uid && b.uid === where.uid));
      if (idx === -1) return null;
      this.bookings[idx] = { ...this.bookings[idx], ...data, updatedAt: new Date() };
      return {
        ...this.bookings[idx],
        eventType: this.eventTypes.find(et => et.id === this.bookings[idx].eventTypeId),
        user: this.users.find(u => u.id === this.bookings[idx].userId),
      };
    }),
  };
}

export class MockPrismaService {
  public organizations: any[] = [];
  public users: any[] = [];
  public warehouses: any[] = [];
  public products: any[] = [];
  public stockLevels: any[] = [];
  public movements: any[] = [];
  public suppliers: any[] = [];
  public purchaseOrders: any[] = [];
  public purchaseOrderItems: any[] = [];

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
      const u = { id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.users.push(u);
      return u;
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.email) return this.users.find(u => u.email === where.email) || null;
      if (where.id) return this.users.find(u => u.id === where.id) || null;
      return null;
    }),
  };

  warehouse = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const wh = { id: `wh-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.warehouses.push(wh);
      return wh;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.warehouses
        .filter(w => !where || !where.organizationId || w.organizationId === where.organizationId)
        .map(w => ({
          ...w,
          stockLevels: this.stockLevels.filter(s => s.warehouseId === w.id),
        }));
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.organizationId_code) {
        return this.warehouses.find(w => w.organizationId === where.organizationId_code.organizationId && w.code === where.organizationId_code.code) || null;
      }
      return this.warehouses.find(w => w.id === where.id) || null;
    }),
  };

  product = {
    findFirst: jest.fn().mockImplementation(async ({ where }) => {
      return this.products.find(p => {
        if (where?.organizationId && p.organizationId !== where.organizationId) return false;
        if (where?.sku && p.sku !== where.sku) return false;
        return true;
      }) || null;
    }),
    create: jest.fn().mockImplementation(async ({ data }) => {
      const p = { id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.products.push(p);
      return p;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      let filtered = this.products.filter(p => !where || !where.organizationId || p.organizationId === where.organizationId);
      if (where?.category) {
        filtered = filtered.filter(p => p.category === where.category);
      }
      return filtered.map(p => ({
        ...p,
        stockLevels: this.stockLevels
          .filter(s => s.productId === p.id)
          .map(s => ({
            ...s,
            warehouse: this.warehouses.find(w => w.id === s.warehouseId),
          })),
      }));
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.organizationId_sku) {
        const found = this.products.find(p => p.organizationId === where.organizationId_sku.organizationId && p.sku === where.organizationId_sku.sku);
        if (!found) return null;
        return {
          ...found,
          stockLevels: this.stockLevels.filter(s => s.productId === found.id),
        };
      }
      const found = this.products.find(p => p.id === where.id);
      if (!found) return null;
      return {
        ...found,
        stockLevels: this.stockLevels.filter(s => s.productId === found.id),
      };
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.products.findIndex(p => p.id === where.id);
      if (idx === -1) return null;
      this.products[idx] = { ...this.products[idx], ...data, updatedAt: new Date() };
      return this.products[idx];
    }),
    delete: jest.fn().mockImplementation(async ({ where }) => {
      const idx = this.products.findIndex(p => p.id === where.id);
      if (idx === -1) return null;
      const [removed] = this.products.splice(idx, 1);
      return removed;
    }),
  };

  stockLevel = {
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      if (where.warehouseId_productId) {
        return this.stockLevels.find(s => s.warehouseId === where.warehouseId_productId.warehouseId && s.productId === where.warehouseId_productId.productId) || null;
      }
      return this.stockLevels.find(s => s.id === where.id) || null;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.stockLevels.filter(s => {
        if (where?.warehouseId && s.warehouseId !== where.warehouseId) return false;
        if (where?.productId && s.productId !== where.productId) return false;
        return true;
      });
    }),
    create: jest.fn().mockImplementation(async ({ data }) => {
      const sl = { id: `sl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.stockLevels.push(sl);
      return sl;
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.stockLevels.findIndex(s => s.id === where.id);
      if (idx === -1) return null;
      this.stockLevels[idx] = { ...this.stockLevels[idx], ...data, updatedAt: new Date() };
      return this.stockLevels[idx];
    }),
  };

  movement = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const m = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...data,
        createdAt: new Date(),
        product: this.products.find(p => p.id === data.productId),
        warehouse: this.warehouses.find(w => w.id === data.warehouseId),
        user: this.users.find(u => u.id === data.userId),
      };
      this.movements.push(m);
      return m;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.movements
        .filter(m => !where || !where.organizationId || m.organizationId === where.organizationId)
        .map(m => ({
          ...m,
          product: this.products.find(p => p.id === m.productId),
          warehouse: this.warehouses.find(w => w.id === m.warehouseId),
          user: this.users.find(u => u.id === m.userId),
        }));
    }),
    count: jest.fn().mockImplementation(async ({ where }) => {
      return this.movements.filter(m => !where || !where.organizationId || m.organizationId === where.organizationId).length;
    }),
  };

  supplier = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const s = { id: `sup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.suppliers.push(s);
      return s;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.suppliers.filter(s => !where || !where.organizationId || s.organizationId === where.organizationId);
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.suppliers.find(s => s.id === where.id) || null;
    }),
  };

  purchaseOrder = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const { items, ...rest } = data;
      const po = {
        id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...rest,
        createdAt: new Date(),
        updatedAt: new Date(),
        supplier: this.suppliers.find(s => s.id === rest.supplierId),
        warehouse: this.warehouses.find(w => w.id === rest.warehouseId),
        items: items?.create ? items.create.map((item: any) => ({
          id: `poi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          ...item,
          product: this.products.find(p => p.id === item.productId),
        })) : [],
      };
      this.purchaseOrders.push(po);
      return po;
    }),
    findMany: jest.fn().mockImplementation(async ({ where }) => {
      return this.purchaseOrders
        .filter(p => !where || !where.organizationId || p.organizationId === where.organizationId)
        .map(p => ({
          ...p,
          supplier: this.suppliers.find(s => s.id === p.supplierId),
          warehouse: this.warehouses.find(w => w.id === p.warehouseId),
          items: p.items,
        }));
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      const po = this.purchaseOrders.find(p => p.id === where.id);
      if (!po) return null;
      return {
        ...po,
        supplier: this.suppliers.find(s => s.id === po.supplierId),
        warehouse: this.warehouses.find(w => w.id === po.warehouseId),
        items: po.items,
      };
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.purchaseOrders.findIndex(p => p.id === where.id);
      if (idx === -1) return null;
      this.purchaseOrders[idx] = { ...this.purchaseOrders[idx], ...data, updatedAt: new Date() };
      return this.purchaseOrders[idx];
    }),
  };

  purchaseOrderItem = {
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      for (const po of this.purchaseOrders) {
        const item = po.items.find((i: any) => i.id === where.id);
        if (item) {
          Object.assign(item, data);
          return item;
        }
      }
      return null;
    }),
  };
}

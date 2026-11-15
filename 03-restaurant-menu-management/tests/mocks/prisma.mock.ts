export class MockPrismaService {
  restaurants: any[] = [];
  users: any[] = [];
  menus: any[] = [];
  categories: any[] = [];
  items: any[] = [];
  variantGroups: any[] = [];
  variantOptions: any[] = [];

  restaurant = {
    findUnique: jest.fn(async ({ where }: { where: any }) => {
      if (where.id) return this.restaurants.find((r) => r.id === where.id) || null;
      if (where.slug) {
        const found = this.restaurants.find((r) => r.slug.toLowerCase() === where.slug.toLowerCase());
        if (!found) return null;
        // Mock include menus -> categories -> items -> variantGroups
        const rMenus = this.menus
          .filter((m) => m.restaurantId === found.id && m.isPublished)
          .map((m) => ({
            ...m,
            categories: this.categories
              .filter((c) => c.menuId === m.id)
              .map((c) => ({
                ...c,
                items: this.items
                  .filter((i) => i.categoryId === c.id)
                  .map((i) => ({
                    ...i,
                    variantGroups: this.variantGroups
                      .filter((vg) => vg.menuItemId === i.id)
                      .map((vg) => ({
                        ...vg,
                        options: this.variantOptions.filter((vo) => vo.variantGroupId === vg.id),
                      })),
                  })),
              })),
          }));
        return { ...found, menus: rMenus };
      }
      return null;
    }),
    findFirst: jest.fn(async ({ where }: { where: any }) => {
      return this.restaurants.find((r) => {
        if (where.slug && r.slug.toLowerCase() !== where.slug.toLowerCase()) return false;
        return true;
      }) || null;
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const created = {
        id: `rest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        currency: 'USD',
        ...data,
      };
      this.restaurants.push(created);
      return created;
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = this.restaurants.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('Restaurant not found');
      this.restaurants[idx] = { ...this.restaurants[idx], ...data, updatedAt: new Date() };
      return this.restaurants[idx];
    }),
  };

  user = {
    findUnique: jest.fn(async ({ where }: { where: any }) => {
      if (where.id) return this.users.find((u) => u.id === where.id) || null;
      if (where.email) return this.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      return null;
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const created = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'OWNER',
        ...data,
      };
      this.users.push(created);
      return created;
    }),
  };

  menu = {
    findUnique: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.menus.find((m) => m.id === where.id);
      if (!found) return null;
      if (include?.categories) {
        return {
          ...found,
          categories: this.categories
            .filter((c) => c.menuId === found.id)
            .map((c) => ({
              ...c,
              items: this.items.filter((i) => i.categoryId === c.id),
            })),
        };
      }
      return found;
    }),
    findMany: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      return this.menus
        .filter((m) => {
          if (where.restaurantId && m.restaurantId !== where.restaurantId) return false;
          return true;
        })
        .map((m) => {
          if (include?.categories) {
            return {
              ...m,
              categories: this.categories
                .filter((c) => c.menuId === m.id)
                .map((c) => ({
                  ...c,
                  items: this.items.filter((i) => i.categoryId === c.id),
                })),
            };
          }
          return m;
        });
    }),
    findFirst: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.menus.find((m) => {
        if (where.id && m.id !== where.id) return false;
        if (where.restaurantId && m.restaurantId !== where.restaurantId) return false;
        return true;
      });
      if (!found) return null;
      if (include?.categories) {
        return {
          ...found,
          categories: this.categories
            .filter((c) => c.menuId === found.id)
            .map((c) => ({
              ...c,
              items: this.items.filter((i) => i.categoryId === c.id),
            })),
        };
      }
      return found;
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const created = {
        id: `menu_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: 0,
        isPublished: true,
        categories: [],
        ...data,
      };
      this.menus.push(created);
      return created;
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = this.menus.findIndex((m) => m.id === where.id);
      if (idx === -1) throw new Error('Menu not found');
      this.menus[idx] = { ...this.menus[idx], ...data, updatedAt: new Date() };
      return this.menus[idx];
    }),
    delete: jest.fn(async ({ where }: { where: any }) => {
      const idx = this.menus.findIndex((m) => m.id === where.id);
      if (idx === -1) throw new Error('Menu not found');
      const deleted = this.menus.splice(idx, 1)[0];
      return deleted;
    }),
  };

  category = {
    findUnique: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.categories.find((c) => c.id === where.id);
      if (!found) return null;
      let res = { ...found };
      if (include?.menu) {
        const menu = this.menus.find((m) => m.id === found.menuId);
        res.menu = menu;
      }
      if (include?.items) {
        res.items = this.items.filter((i) => i.categoryId === found.id);
      }
      return res;
    }),
    findFirst: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.categories.find((c) => {
        if (where.id && c.id !== where.id) return false;
        if (where.menu?.restaurantId) {
          const menu = this.menus.find((m) => m.id === c.menuId);
          if (!menu || menu.restaurantId !== where.menu.restaurantId) return false;
        }
        return true;
      });
      if (!found) return null;
      let res = { ...found };
      if (include?.menu) {
        const menu = this.menus.find((m) => m.id === found.menuId);
        res.menu = menu;
      }
      if (include?.items) {
        res.items = this.items.filter((i) => i.categoryId === found.id);
      }
      return res;
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const created = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: 0,
        items: [],
        ...data,
      };
      this.categories.push(created);
      return created;
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = this.categories.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Category not found');
      this.categories[idx] = { ...this.categories[idx], ...data, updatedAt: new Date() };
      return this.categories[idx];
    }),
    delete: jest.fn(async ({ where }: { where: any }) => {
      const idx = this.categories.findIndex((c) => c.id === where.id);
      if (idx === -1) throw new Error('Category not found');
      const deleted = this.categories.splice(idx, 1)[0];
      return deleted;
    }),
  };

  menuItem = {
    findUnique: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.items.find((i) => i.id === where.id);
      if (!found) return null;
      let res = { ...found };
      if (include?.category) {
        const cat = this.categories.find((c) => c.id === found.categoryId);
        let catWithMenu = cat ? { ...cat } : null;
        if (include?.category?.include?.menu && cat) {
          catWithMenu.menu = this.menus.find((m) => m.id === cat.menuId);
        }
        res.category = catWithMenu;
      }
      if (include?.variantGroups) {
        res.variantGroups = this.variantGroups
          .filter((vg) => vg.menuItemId === found.id)
          .map((vg) => ({
            ...vg,
            options: this.variantOptions.filter((vo) => vo.variantGroupId === vg.id),
          }));
      }
      return res;
    }),
    findFirst: jest.fn(async ({ where, include }: { where: any; include?: any }) => {
      const found = this.items.find((item) => {
        if (where.id && item.id !== where.id) return false;
        if (where.category?.menu?.restaurantId) {
          const cat = this.categories.find((c) => c.id === item.categoryId);
          if (!cat) return false;
          const menu = this.menus.find((m) => m.id === cat.menuId);
          if (!menu || menu.restaurantId !== where.category.menu.restaurantId) return false;
        }
        return true;
      });
      if (!found) return null;
      let res = { ...found };
      if (include?.category) {
        const cat = this.categories.find((c) => c.id === found.categoryId);
        let catWithMenu = cat ? { ...cat } : null;
        if (include?.category?.include?.menu && cat) {
          catWithMenu.menu = this.menus.find((m) => m.id === cat.menuId);
        }
        res.category = catWithMenu;
      }
      if (include?.variantGroups) {
        res.variantGroups = this.variantGroups
          .filter((vg) => vg.menuItemId === found.id)
          .map((vg) => ({
            ...vg,
            options: this.variantOptions.filter((vo) => vo.variantGroupId === vg.id),
          }));
      }
      return res;
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const created = {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: 0,
        isAvailable: true,
        ...data,
      };
      this.items.push(created);
      return created;
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = this.items.findIndex((i) => i.id === where.id);
      if (idx === -1) throw new Error('Item not found');
      this.items[idx] = { ...this.items[idx], ...data, updatedAt: new Date() };
      return this.items[idx];
    }),
    delete: jest.fn(async ({ where }: { where: any }) => {
      const idx = this.items.findIndex((i) => i.id === where.id);
      if (idx === -1) throw new Error('Item not found');
      return this.items.splice(idx, 1)[0];
    }),
  };

  variantGroup = {
    create: jest.fn(async ({ data }: { data: any }) => {
      const vg = {
        id: `vg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...data,
      };
      this.variantGroups.push(vg);
      return vg;
    }),
    deleteMany: jest.fn(async () => ({ count: 0 })),
  };

  variantOption = {
    create: jest.fn(async ({ data }: { data: any }) => {
      const vo = {
        id: `vo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        ...data,
      };
      this.variantOptions.push(vo);
      return vo;
    }),
  };

  $transaction = jest.fn(async (cb: (prisma: any) => Promise<any>) => {
    return cb(this);
  });

  reset() {
    this.restaurants = [];
    this.users = [];
    this.menus = [];
    this.categories = [];
    this.items = [];
    this.variantGroups = [];
    this.variantOptions = [];
    jest.clearAllMocks();
  }
}

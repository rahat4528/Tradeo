import { MenusService } from '../../backend/src/modules/menus/menus.service';
import { CategoriesService } from '../../backend/src/modules/categories/categories.service';
import { ItemsService } from '../../backend/src/modules/items/items.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Restaurant Multi-Tenant Security & Isolation Tests', () => {
  let prisma: MockPrismaService;
  let menusService: MenusService;
  let categoriesService: CategoriesService;
  let itemsService: ItemsService;

  const RESTAURANT_A = 'rest_tenant_A';
  const RESTAURANT_B = 'rest_tenant_B';

  beforeEach(async () => {
    prisma = new MockPrismaService();
    menusService = new MenusService(prisma as any);
    categoriesService = new CategoriesService(prisma as any);
    itemsService = new ItemsService(prisma as any);
  });

  it('should prevent Restaurant B from updating or deleting Restaurant A menu', async () => {
    // Menu created by Restaurant A
    const menuA = await menusService.createMenu(RESTAURANT_A, {
      title: 'Restaurant A Secret Recipes',
      isPublished: true,
    });

    // Restaurant B tries to update Restaurant A's menu
    await expect(
      menusService.updateMenu(menuA.id, RESTAURANT_B, {
        title: 'Hacked Menu',
      }),
    ).rejects.toThrow(ForbiddenException);

    // Restaurant B tries to delete Restaurant A's menu
    await expect(menusService.deleteMenu(menuA.id, RESTAURANT_B)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should prevent Restaurant B from adding categories to Restaurant A menu', async () => {
    const menuA = await menusService.createMenu(RESTAURANT_A, {
      title: 'Restaurant A Menu',
    });

    // Restaurant B attempts to add category to menuA
    await expect(
      categoriesService.createCategory(menuA.id, RESTAURANT_B, {
        name: 'Malicious Category',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should prevent Restaurant B from toggling availability (86-ing) of Restaurant A item', async () => {
    const menuA = await menusService.createMenu(RESTAURANT_A, { title: 'Menu A' });
    const catA = await categoriesService.createCategory(menuA.id, RESTAURANT_A, {
      name: 'Mains A',
    });
    const itemA = await itemsService.createItem(catA.id, RESTAURANT_A, {
      name: 'Signature Ribeye',
      price: 45.0,
    });

    // Restaurant B attempts to 86 Restaurant A's item
    await expect(
      itemsService.toggleAvailability(itemA.id, RESTAURANT_B),
    ).rejects.toThrow(ForbiddenException);
  });
});

import { MenusService } from '../../backend/src/modules/menus/menus.service';
import { CategoriesService } from '../../backend/src/modules/categories/categories.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';

describe('Menus & Categories Service Integration Tests', () => {
  let prisma: MockPrismaService;
  let menusService: MenusService;
  let categoriesService: CategoriesService;

  beforeEach(() => {
    prisma = new MockPrismaService();
    menusService = new MenusService(prisma as any);
    categoriesService = new CategoriesService(prisma as any);
  });

  it('should create and retrieve a restaurant menu', async () => {
    const restaurantId = 'rest_test_01';
    const menu = await menusService.createMenu(restaurantId, {
      title: 'Dinner Menu',
      description: 'Evening fine dining',
      startTime: '17:00',
      endTime: '22:00',
      daysOfWeek: '1,2,3,4,5,6,0',
      isPublished: true,
    });

    expect(menu).toBeDefined();
    expect(menu.title).toBe('Dinner Menu');
    expect(menu.restaurantId).toBe(restaurantId);

    const list = await menusService.getRestaurantMenus(restaurantId);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(menu.id);
  });

  it('should add categories under a menu', async () => {
    const restaurantId = 'rest_test_01';
    const menu = await menusService.createMenu(restaurantId, {
      title: 'All Day Dining',
      isPublished: true,
    });

    const category = await categoriesService.createCategory(menu.id, restaurantId, {
      name: 'Antipasti',
      description: 'Traditional starters',
      sortOrder: 1,
    });

    expect(category).toBeDefined();
    expect(category.name).toBe('Antipasti');
    expect(category.menuId).toBe(menu.id);
  });

  it('should prevent creating a category for non-existent menu', async () => {
    await expect(
      categoriesService.createCategory('non_existent_menu', 'rest_01', {
        name: 'Desserts',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update menu metadata and published state', async () => {
    const restaurantId = 'rest_test_01';
    const menu = await menusService.createMenu(restaurantId, {
      title: 'Draft Specials',
      isPublished: false,
    });

    const updated = await menusService.updateMenu(menu.id, restaurantId, {
      title: 'Published Specials',
      isPublished: true,
    });

    expect(updated.title).toBe('Published Specials');
    expect(updated.isPublished).toBe(true);
  });

  it('should delete menu and remove from restaurant list', async () => {
    const restaurantId = 'rest_test_01';
    const menu = await menusService.createMenu(restaurantId, {
      title: 'Temporary Seasonal',
    });

    await menusService.deleteMenu(menu.id, restaurantId);

    const list = await menusService.getRestaurantMenus(restaurantId);
    expect(list.length).toBe(0);
  });
});

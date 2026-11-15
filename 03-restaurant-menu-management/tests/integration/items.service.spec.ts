import { ItemsService } from '../../backend/src/modules/items/items.service';
import { MenusService } from '../../backend/src/modules/menus/menus.service';
import { CategoriesService } from '../../backend/src/modules/categories/categories.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';

describe('Items & Dishes Service Integration Tests', () => {
  let prisma: MockPrismaService;
  let itemsService: ItemsService;
  let menusService: MenusService;
  let categoriesService: CategoriesService;
  const restaurantId = 'rest_test_02';

  beforeEach(() => {
    prisma = new MockPrismaService();
    itemsService = new ItemsService(prisma as any);
    menusService = new MenusService(prisma as any);
    categoriesService = new CategoriesService(prisma as any);
  });

  it('should create a dish with dietary flags and variant groups', async () => {
    const menu = await menusService.createMenu(restaurantId, { title: 'Dinner' });
    const category = await categoriesService.createCategory(menu.id, restaurantId, {
      name: 'Main Courses',
    });

    const item = await itemsService.createItem(category.id, restaurantId, {
      name: 'Risotto ai Funghi',
      description: 'Carnaroli rice with wild forest porcini and parmigiano',
      price: 24.0,
      dietary: 'Vegetarian,Gluten-Free',
      allergens: 'Milk',
      variants: [
        {
          name: 'Portion Size',
          minSelections: 1,
          maxSelections: 1,
          options: [
            { name: 'Standard', priceDelta: 0 },
            { name: 'Sharing Size', priceDelta: 10 },
          ],
        },
      ],
    });

    expect(item).toBeDefined();
    expect(item.name).toBe('Risotto ai Funghi');
    expect(item.dietary).toContain('Vegetarian');
    expect(item.isAvailable).toBe(true);
    expect(item.variantGroups.length).toBe(1);
    expect(item.variantGroups[0].options.length).toBe(2);
  });

  it('should toggle item availability (86-ing an item)', async () => {
    const menu = await menusService.createMenu(restaurantId, { title: 'Bar Menu' });
    const category = await categoriesService.createCategory(menu.id, restaurantId, {
      name: 'Cocktails',
    });
    const item = await itemsService.createItem(category.id, restaurantId, {
      name: 'Smoked Negroni',
      price: 15.0,
    });

    expect(item.isAvailable).toBe(true);

    const toggled = await itemsService.toggleAvailability(item.id, restaurantId);
    expect(toggled.isAvailable).toBe(false);

    const restored = await itemsService.toggleAvailability(item.id, restaurantId);
    expect(restored.isAvailable).toBe(true);
  });

  it('should delete a dish', async () => {
    const menu = await menusService.createMenu(restaurantId, { title: 'Brunch' });
    const category = await categoriesService.createCategory(menu.id, restaurantId, {
      name: 'Eggs',
    });
    const item = await itemsService.createItem(category.id, restaurantId, {
      name: 'Eggs Benedict',
      price: 16.0,
    });

    await itemsService.deleteItem(item.id, restaurantId);

    await expect(itemsService.getItemById(item.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});

import { PublicService } from '../../backend/src/modules/public/public.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { NotFoundException } from '@nestjs/common';

describe('Public Digital Menu & QR Code API Tests', () => {
  let prisma: MockPrismaService;
  let publicService: PublicService;
  let mockConfigService: any;

  beforeEach(() => {
    prisma = new MockPrismaService();
    mockConfigService = {
      get: jest.fn((key: string, defaultValue: any) => defaultValue),
    };
    publicService = new PublicService(prisma as any, mockConfigService);
  });

  it('should return published menu and dishes for a valid restaurant slug', async () => {
    // Seed mock restaurant
    const rest = await prisma.restaurant.create({
      data: {
        name: 'Trattoria Bella',
        slug: 'trattoria-bella',
        currency: 'USD',
        description: 'Authentic handmade pasta',
      },
    });

    const menu = await prisma.menu.create({
      data: {
        restaurantId: rest.id,
        title: 'Lunch Specials',
        isPublished: true,
      },
    });

    const cat = await prisma.category.create({
      data: {
        menuId: menu.id,
        name: 'Fresh Pasta',
      },
    });

    await prisma.menuItem.create({
      data: {
        categoryId: cat.id,
        name: 'Pappardelle al Cinghiale',
        price: 22.0,
      },
    });

    const publicMenu = await publicService.getPublicMenu('trattoria-bella');
    expect(publicMenu).toBeDefined();
    expect(publicMenu.restaurant.name).toBe('Trattoria Bella');
    expect(publicMenu.menus.length).toBe(1);
    expect(publicMenu.menus[0].title).toBe('Lunch Specials');
    expect(publicMenu.menus[0].categories[0].name).toBe('Fresh Pasta');
    expect(publicMenu.menus[0].categories[0].items[0].name).toBe('Pappardelle al Cinghiale');
  });

  it('should throw NotFoundException if restaurant slug does not exist', async () => {
    await expect(publicService.getPublicMenu('non-existent-restaurant')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should generate QR code in SVG format for restaurant', async () => {
    await prisma.restaurant.create({
      data: {
        name: 'Trattoria Bella',
        slug: 'trattoria-bella',
      },
    });

    const qrResult = await publicService.generateQr('trattoria-bella', { format: 'svg' });
    expect(qrResult).toBeDefined();
    expect(qrResult.mimeType).toBe('image/svg+xml');
    expect(typeof qrResult.data).toBe('string');
    expect(qrResult.data).toContain('<svg');
  });

  it('should generate QR code with table parameter', async () => {
    await prisma.restaurant.create({
      data: {
        name: 'Trattoria Bella',
        slug: 'trattoria-bella',
      },
    });

    const qrResult = await publicService.generateQr('trattoria-bella', {
      format: 'svg',
      table: 'Patio-4',
    });
    expect(qrResult.mimeType).toBe('image/svg+xml');
    expect(qrResult.data).toBeDefined();
  });
});

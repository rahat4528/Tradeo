import { ProductsService } from '../../backend/src/modules/products/products.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductsService (Integration)', () => {
  let service: ProductsService;
  let prisma: MockPrismaService;
  const orgId = 'org-corp-1';

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new ProductsService(prisma as any);
  });

  it('creates a new product SKU and calculates initial valuation', async () => {
    const product = await service.createProduct(orgId, {
      sku: 'SKU-TABLE-001',
      name: 'Executive Oak Desk',
      category: 'Furniture',
      costPrice: 250,
      sellingPrice: 499,
      reorderPoint: 5,
    });

    expect(product).toBeDefined();
    expect(product.sku).toBe('SKU-TABLE-001');
    expect(product.costPrice).toBe(250);
  });

  it('prevents duplicate SKU in the same organization', async () => {
    await service.createProduct(orgId, {
      sku: 'SKU-DUPLICATE-01',
      name: 'Item One',
      costPrice: 10,
      sellingPrice: 20,
      reorderPoint: 5,
    });

    await expect(
      service.createProduct(orgId, {
        sku: 'SKU-DUPLICATE-01',
        name: 'Item Two',
        costPrice: 10,
        sellingPrice: 20,
        reorderPoint: 5,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('returns products with accurate total stock and low-stock flagging', async () => {
    const prod = await service.createProduct(orgId, {
      sku: 'SKU-ALERT-01',
      name: 'Printer Cartridge',
      costPrice: 30,
      sellingPrice: 65,
      reorderPoint: 10,
    });

    // Add stock level of 8 (below reorderPoint 10)
    await prisma.stockLevel.create({
      data: {
        warehouseId: 'wh-main',
        productId: prod.id,
        quantity: 8,
      },
    });

    const result = await service.getProducts(orgId, {});
    expect(result.length).toBeGreaterThan(0);
    const item = result.find((p) => p.id === prod.id);
    expect(item).toBeDefined();
    expect(item?.totalStock).toBe(8);
    expect(item?.isLowStock).toBe(true);
  });
});

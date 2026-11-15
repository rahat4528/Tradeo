import { ProductsService } from '../../backend/src/modules/products/products.service';
import { MovementsService } from '../../backend/src/modules/movements/movements.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MovementType } from '@prisma/client';

describe('Inventory Security Tests - Tenant Isolation', () => {
  let productsService: ProductsService;
  let movementsService: MovementsService;
  let prisma: MockPrismaService;

  const orgA = 'org-company-alpha';
  const orgB = 'org-company-beta';

  beforeEach(async () => {
    prisma = new MockPrismaService();
    productsService = new ProductsService(prisma as any);
    movementsService = new MovementsService(prisma as any);

    // Alpha setup
    await prisma.warehouse.create({
      data: { id: 'wh-alpha', organizationId: orgA, name: 'Alpha Warehouse', code: 'WH-A' },
    });
    await prisma.product.create({
      data: { id: 'prod-alpha', organizationId: orgA, sku: 'SKU-ALPHA-1', name: 'Alpha Secret Hardware', costPrice: 100, sellingPrice: 200, reorderPoint: 10 },
    });

    // Beta setup
    await prisma.warehouse.create({
      data: { id: 'wh-beta', organizationId: orgB, name: 'Beta Warehouse', code: 'WH-B' },
    });
    await prisma.product.create({
      data: { id: 'prod-beta', organizationId: orgB, sku: 'SKU-BETA-1', name: 'Beta Standard Part', costPrice: 20, sellingPrice: 40, reorderPoint: 5 },
    });
  });

  it('prevents Org B from retrieving products owned by Org A', async () => {
    const orgBProducts = await productsService.getProducts(orgB, {});
    const leakedProduct = orgBProducts.find(p => p.id === 'prod-alpha');
    expect(leakedProduct).toBeUndefined();

    await expect(
      productsService.getProductById('prod-alpha', orgB),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents Org B from adjusting stock in Org A warehouse facility', async () => {
    await expect(
      movementsService.adjustStock(orgB, 'user-beta', {
        productId: 'prod-alpha',
        warehouseId: 'wh-alpha',
        type: MovementType.ADJUSTMENT_IN,
        quantity: 100,
      }),
    ).rejects.toThrow();
  });

  it('prevents inter-organization unauthorized stock transfers', async () => {
    await expect(
      movementsService.transferStock(orgB, 'user-beta', {
        productId: 'prod-beta',
        sourceWarehouseId: 'wh-beta',
        destinationWarehouseId: 'wh-alpha', // Cross-tenant transfer target
        quantity: 5,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

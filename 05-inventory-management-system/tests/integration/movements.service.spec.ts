import { MovementsService } from '../../backend/src/modules/movements/movements.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { MovementType } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('MovementsService (Integration)', () => {
  let service: MovementsService;
  let prisma: MockPrismaService;
  const orgId = 'org-movements-test';
  const userId = 'user-mgr-1';

  beforeEach(async () => {
    prisma = new MockPrismaService();
    service = new MovementsService(prisma as any);

    // Seed product and warehouses
    await prisma.warehouse.create({
      data: { id: 'wh-north', organizationId: orgId, name: 'North Hub', code: 'WH-N' },
    });
    await prisma.warehouse.create({
      data: { id: 'wh-south', organizationId: orgId, name: 'South Hub', code: 'WH-S' },
    });
    await prisma.product.create({
      data: { id: 'prod-motor', organizationId: orgId, sku: 'SKU-MOTOR-1', name: 'Stepper Motor', costPrice: 40, sellingPrice: 80, reorderPoint: 5 },
    });
  });

  it('adjusts warehouse stock upwards on receiving', async () => {
    const res = await service.adjustStock(orgId, userId, {
      productId: 'prod-motor',
      warehouseId: 'wh-north',
      type: MovementType.RECEIVING,
      quantity: 50,
      reference: 'PO-1001',
      notes: 'Initial receipt of shipment',
    });

    expect(res.stockLevel.quantity).toBe(50);
    expect(res.movement.resultingQuantity).toBe(50);
    expect(res.movement.quantityDelta).toBe(50);
  });

  it('relocates stock between warehouses via transfer', async () => {
    // Prime source warehouse with 30 units
    await service.adjustStock(orgId, userId, {
      productId: 'prod-motor',
      warehouseId: 'wh-north',
      type: MovementType.ADJUSTMENT_IN,
      quantity: 30,
    });

    // Transfer 12 units to South warehouse
    const transferRes = await service.transferStock(orgId, userId, {
      productId: 'prod-motor',
      sourceWarehouseId: 'wh-north',
      destinationWarehouseId: 'wh-south',
      quantity: 12,
      notes: 'Replenishing South facility',
    });

    expect(transferRes.sourceResultingStock).toBe(18);
    expect(transferRes.destinationResultingStock).toBe(12);
  });

  it('throws BadRequestException if transfer quantity exceeds available stock', async () => {
    // wh-north has 0 units initially
    await expect(
      service.transferStock(orgId, userId, {
        productId: 'prod-motor',
        sourceWarehouseId: 'wh-north',
        destinationWarehouseId: 'wh-south',
        quantity: 10,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

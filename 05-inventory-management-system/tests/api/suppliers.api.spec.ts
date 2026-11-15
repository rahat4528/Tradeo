import { SuppliersService } from '../../backend/src/modules/suppliers/suppliers.service';
import { MockPrismaService } from '../mocks/prisma.mock';
import { POStatus } from '@prisma/client';

describe('SuppliersService (Procurement & PO Lifecycle)', () => {
  let service: SuppliersService;
  let prisma: MockPrismaService;
  const orgId = 'org-supply-chain';
  const userId = 'user-procurement-1';

  beforeEach(async () => {
    prisma = new MockPrismaService();
    service = new SuppliersService(prisma as any);

    await prisma.warehouse.create({
      data: { id: 'wh-inbound', organizationId: orgId, name: 'Inbound Receiving', code: 'WH-IN' },
    });
    await prisma.product.create({
      data: { id: 'prod-screw', organizationId: orgId, sku: 'SKU-SCREW-M4', name: 'M4 Steel Screw', costPrice: 0.1, sellingPrice: 0.25, reorderPoint: 500 },
    });
  });

  it('creates an approved supplier and creates a PO with line items', async () => {
    const supplier = await service.createSupplier(orgId, {
      name: 'Fasteners Direct Inc',
      contactPerson: 'Alice Clark',
      email: 'sales@fastenersdirect.com',
      phone: '+1 555-4321',
    });

    expect(supplier.name).toBe('Fasteners Direct Inc');

    const po = await service.createPurchaseOrder(orgId, {
      supplierId: supplier.id,
      warehouseId: 'wh-inbound',
      poNumber: 'PO-2026-0001',
      items: [
        { productId: 'prod-screw', quantityOrdered: 2000, unitCost: 0.08 },
      ],
    });

    expect(po.poNumber).toBe('PO-2026-0001');
    expect(po.totalCost).toBe(160);
    expect(po.items.length).toBe(1);
  });

  it('receives goods on purchase order and increments warehouse stock', async () => {
    const supplier = await service.createSupplier(orgId, {
      name: 'Fasteners Direct Inc',
    });

    const po = await service.createPurchaseOrder(orgId, {
      supplierId: supplier.id,
      warehouseId: 'wh-inbound',
      poNumber: 'PO-2026-0002',
      items: [
        { productId: 'prod-screw', quantityOrdered: 500, unitCost: 0.09 },
      ],
    });

    const receivedPo = await service.receivePurchaseOrder(po.id, orgId, userId);
    expect(receivedPo.status).toBe(POStatus.RECEIVED);

    // Verify stock level in wh-inbound
    const stock = await prisma.stockLevel.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: 'wh-inbound',
          productId: 'prod-screw',
        },
      },
    });
    expect(stock?.quantity).toBe(500);
  });
});

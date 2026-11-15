import { PrismaClient, Role, MovementType, POStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Inventory Management database...');

  const org = await prisma.organization.create({
    data: {
      name: 'Vanguard Industrial Supplies',
      currency: 'USD',
    },
  });

  const passwordHash = await bcrypt.hash('WarehousePass123!', 10);

  const admin = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@vanguard.local',
      passwordHash,
      name: 'Elena Rostova',
      role: Role.ADMIN,
    },
  });

  const whMain = await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      code: 'WH-MAIN',
      name: 'Central Distribution Center',
      address: '100 Industrial Parkway, Chicago IL',
      phone: '+1 (312) 555-0100',
    },
  });

  const whWest = await prisma.warehouse.create({
    data: {
      organizationId: org.id,
      code: 'WH-WEST',
      name: 'West Coast Logistics Facility',
      address: '880 Harbor Way, Long Beach CA',
      phone: '+1 (562) 555-0199',
    },
  });

  const supplier = await prisma.supplier.create({
    data: {
      organizationId: org.id,
      name: 'Pacific Hardware Components Ltd',
      contactPerson: 'David Chen',
      email: 'sales@pacifichardware.example',
      phone: '+1 (800) 555-8822',
      paymentTerms: 'Net 30',
    },
  });

  // Product 1: High stock
  const p1 = await prisma.product.create({
    data: {
      organizationId: org.id,
      sku: 'FAST-M8-BOLT-100PK',
      barcode: '0123456789012',
      name: 'Grade 8.8 M8 Hex Bolts (Pack of 100)',
      description: 'Zinc-plated metric hex cap screws for heavy industrial assembly.',
      category: 'Fasteners',
      unit: 'BOX',
      costPrice: 8.50,
      sellingPrice: 19.99,
      reorderPoint: 40,
    },
  });

  await prisma.stockLevel.create({
    data: {
      warehouseId: whMain.id,
      productId: p1.id,
      quantity: 150,
    },
  });

  await prisma.movement.create({
    data: {
      organizationId: org.id,
      warehouseId: whMain.id,
      productId: p1.id,
      type: MovementType.RECEIVING,
      quantityDelta: 150,
      previousQuantity: 0,
      resultingQuantity: 150,
      reference: 'INIT-LOAD',
      notes: 'Initial warehouse intake',
      userId: admin.id,
    },
  });

  // Product 2: Low stock alert trigger
  const p2 = await prisma.product.create({
    data: {
      organizationId: org.id,
      sku: 'LUBR-SYN-5L',
      barcode: '0123456789099',
      name: 'Synthetic Industrial Bearing Grease 5L',
      description: 'High temperature synthetic polyurea grease.',
      category: 'Lubricants',
      unit: 'CAN',
      costPrice: 42.00,
      sellingPrice: 89.00,
      reorderPoint: 25,
    },
  });

  await prisma.stockLevel.create({
    data: {
      warehouseId: whMain.id,
      productId: p2.id,
      quantity: 12, // Below reorder point of 25!
    },
  });

  console.log(`Seeding complete: Created organization ${org.name}, 2 warehouses, and 2 SKUs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MovementType, POStatus } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async createSupplier(organizationId: string, data: {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    paymentTerms?: string;
  }) {
    return this.prisma.supplier.create({
      data: {
        organizationId,
        name: data.name.trim(),
        contactPerson: data.contactPerson?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        paymentTerms: data.paymentTerms || 'Net 30',
      },
    });
  }

  async getSuppliers(organizationId: string) {
    return this.prisma.supplier.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });
  }

  async createPurchaseOrder(organizationId: string, data: {
    supplierId: string;
    warehouseId: string;
    poNumber: string;
    notes?: string;
    items: { productId: string; quantityOrdered: number; unitCost: number }[];
  }) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: data.supplierId } });
    if (!supplier || supplier.organizationId !== organizationId) {
      throw new NotFoundException('Supplier not found.');
    }

    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
    if (!warehouse || warehouse.organizationId !== organizationId) {
      throw new NotFoundException('Warehouse not found.');
    }

    const totalCost = data.items.reduce((sum, item) => sum + item.quantityOrdered * item.unitCost, 0);

    return this.prisma.purchaseOrder.create({
      data: {
        organizationId,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        poNumber: data.poNumber.toUpperCase().trim(),
        totalCost,
        notes: data.notes || null,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            quantityOrdered: i.quantityOrdered,
            unitCost: i.unitCost,
          })),
        },
      },
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: true } },
      },
    });
  }

  async getPurchaseOrders(organizationId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: true } },
      },
    });
  }

  async receivePurchaseOrder(id: string, organizationId: string, userId: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!po) throw new NotFoundException('Purchase order not found.');
    if (po.organizationId !== organizationId) throw new ForbiddenException('Access denied.');
    if (po.status === POStatus.RECEIVED) {
      throw new BadRequestException('This purchase order has already been received.');
    }

    // Intake each item into designated warehouse
    for (const item of po.items) {
      let stock = await this.prisma.stockLevel.findUnique({
        where: {
          warehouseId_productId: {
            warehouseId: po.warehouseId,
            productId: item.productId,
          },
        },
      });

      const currentQty = stock ? stock.quantity : 0;
      const newQty = currentQty + item.quantityOrdered;

      if (stock) {
        await this.prisma.stockLevel.update({
          where: { id: stock.id },
          data: { quantity: newQty },
        });
      } else {
        await this.prisma.stockLevel.create({
          data: {
            warehouseId: po.warehouseId,
            productId: item.productId,
            quantity: newQty,
          },
        });
      }

      // Record movement
      await this.prisma.movement.create({
        data: {
          organizationId,
          productId: item.productId,
          warehouseId: po.warehouseId,
          type: MovementType.RECEIVING,
          quantityDelta: item.quantityOrdered,
          previousQuantity: currentQty,
          resultingQuantity: newQty,
          reference: `PO_${po.poNumber}`,
          notes: `Goods receipt from supplier`,
          userId,
        },
      });
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: POStatus.RECEIVED,
        receivedDate: new Date(),
      },
      include: {
        supplier: true,
        warehouse: true,
        items: { include: { product: true } },
      },
    });
  }
}

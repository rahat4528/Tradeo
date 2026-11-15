import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async adjustStock(organizationId: string, userId: string, dto: AdjustStockDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.organizationId !== organizationId) throw new ForbiddenException('Access denied to product.');

    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found.');
    if (warehouse.organizationId !== organizationId) throw new ForbiddenException('Access denied to warehouse.');

    // Find or create current stock level
    let stockLevel = await this.prisma.stockLevel.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
        },
      },
    });

    const currentQty = stockLevel ? stockLevel.quantity : 0;
    const additiveTypes: MovementType[] = [MovementType.RECEIVING, MovementType.ADJUSTMENT_IN, MovementType.TRANSFER_IN];
    const isAdditive = additiveTypes.includes(dto.type);
    const quantityDelta = isAdditive ? Math.abs(dto.quantity) : -Math.abs(dto.quantity);
    const resultingQty = currentQty + quantityDelta;

    if (resultingQty < 0) {
      throw new BadRequestException(`Insufficient stock. Current on-hand is ${currentQty}, cannot deduct ${Math.abs(dto.quantity)} units.`);
    }

    // Upsert stock level
    if (stockLevel) {
      stockLevel = await this.prisma.stockLevel.update({
        where: { id: stockLevel.id },
        data: { quantity: resultingQty },
      });
    } else {
      stockLevel = await this.prisma.stockLevel.create({
        data: {
          warehouseId: dto.warehouseId,
          productId: dto.productId,
          quantity: resultingQty,
        },
      });
    }

    // Record immutable audit movement
    const movement = await this.prisma.movement.create({
      data: {
        organizationId,
        productId: dto.productId,
        warehouseId: dto.warehouseId,
        type: dto.type,
        quantityDelta,
        previousQuantity: currentQty,
        resultingQuantity: resultingQty,
        reference: dto.reference || null,
        notes: dto.notes || null,
        userId,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    return {
      message: 'Stock adjustment applied successfully.',
      stockLevel,
      movement,
    };
  }

  async transferStock(organizationId: string, userId: string, dto: TransferStockDto) {
    if (dto.sourceWarehouseId === dto.destinationWarehouseId) {
      throw new BadRequestException('Source and destination warehouse cannot be the same facility.');
    }

    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.organizationId !== organizationId) {
      throw new NotFoundException('Product not found or access denied.');
    }

    const sourceWh = await this.prisma.warehouse.findUnique({ where: { id: dto.sourceWarehouseId } });
    const destWh = await this.prisma.warehouse.findUnique({ where: { id: dto.destinationWarehouseId } });
    if (!sourceWh || sourceWh.organizationId !== organizationId || !destWh || destWh.organizationId !== organizationId) {
      throw new NotFoundException('One or both warehouse facilities could not be found.');
    }

    // 1. Deduct from source warehouse
    const sourceStock = await this.prisma.stockLevel.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: dto.sourceWarehouseId,
          productId: dto.productId,
        },
      },
    });

    const currentSourceQty = sourceStock ? sourceStock.quantity : 0;
    if (currentSourceQty < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock in source facility '${sourceWh.name}'. On-hand: ${currentSourceQty}, Requested: ${dto.quantity}`,
      );
    }

    const newSourceQty = currentSourceQty - dto.quantity;
    await this.prisma.stockLevel.update({
      where: { id: sourceStock!.id },
      data: { quantity: newSourceQty },
    });

    // Record TRANSFER_OUT
    const outMovement = await this.prisma.movement.create({
      data: {
        organizationId,
        productId: dto.productId,
        warehouseId: dto.sourceWarehouseId,
        type: MovementType.TRANSFER_OUT,
        quantityDelta: -dto.quantity,
        previousQuantity: currentSourceQty,
        resultingQuantity: newSourceQty,
        reference: dto.reference || `TRANSFER_TO_${destWh.code}`,
        notes: dto.notes || `Transferred to ${destWh.name}`,
        userId,
      },
    });

    // 2. Add to destination warehouse
    let destStock = await this.prisma.stockLevel.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId: dto.destinationWarehouseId,
          productId: dto.productId,
        },
      },
    });

    const currentDestQty = destStock ? destStock.quantity : 0;
    const newDestQty = currentDestQty + dto.quantity;

    if (destStock) {
      await this.prisma.stockLevel.update({
        where: { id: destStock.id },
        data: { quantity: newDestQty },
      });
    } else {
      await this.prisma.stockLevel.create({
        data: {
          warehouseId: dto.destinationWarehouseId,
          productId: dto.productId,
          quantity: newDestQty,
        },
      });
    }

    // Record TRANSFER_IN
    const inMovement = await this.prisma.movement.create({
      data: {
        organizationId,
        productId: dto.productId,
        warehouseId: dto.destinationWarehouseId,
        type: MovementType.TRANSFER_IN,
        quantityDelta: dto.quantity,
        previousQuantity: currentDestQty,
        resultingQuantity: newDestQty,
        reference: dto.reference || `TRANSFER_FROM_${sourceWh.code}`,
        notes: dto.notes || `Received from ${sourceWh.name}`,
        userId,
      },
    });

    return {
      message: `Successfully transferred ${dto.quantity} units from ${sourceWh.name} to ${destWh.name}.`,
      transferredQuantity: dto.quantity,
      sourceResultingStock: newSourceQty,
      destinationResultingStock: newDestQty,
      movements: [outMovement, inMovement],
    };
  }

  async getMovements(organizationId: string, limit: number = 50) {
    return this.prisma.movement.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        product: { select: { id: true, sku: true, name: true, unit: true } },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });
  }
}

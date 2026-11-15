import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async createWarehouse(organizationId: string, dto: CreateWarehouseDto) {
    const existing = await this.prisma.warehouse.findFirst({
      where: {
        organizationId,
        code: dto.code.toUpperCase().trim(),
      },
    });

    if (existing) {
      throw new ConflictException(`Warehouse with code '${dto.code}' already exists.`);
    }

    return this.prisma.warehouse.create({
      data: {
        organizationId,
        code: dto.code.toUpperCase().trim(),
        name: dto.name.trim(),
        address: dto.address?.trim() || null,
        phone: dto.phone?.trim() || null,
      },
    });
  }

  async getWarehouses(organizationId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { organizationId },
      include: {
        stockLevels: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return warehouses.map((wh) => {
      const totalUnits = wh.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
      const totalSkus = wh.stockLevels.length;
      return {
        ...wh,
        totalUnits,
        totalSkus,
      };
    });
  }

  async getWarehouseById(id: string, organizationId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        stockLevels: {
          include: { product: true },
          orderBy: { quantity: 'asc' },
        },
      },
    });

    if (!warehouse) throw new NotFoundException('Warehouse not found.');
    if (warehouse.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    const totalUnits = warehouse.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
    const totalSkus = warehouse.stockLevels.length;

    return {
      ...warehouse,
      totalUnits,
      totalSkus,
    };
  }

  async deleteWarehouse(id: string, organizationId: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: { stockLevels: true },
    });

    if (!warehouse) throw new NotFoundException('Warehouse not found.');
    if (warehouse.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    const hasStock = warehouse.stockLevels.some((sl) => sl.quantity > 0);
    if (hasStock) {
      throw new ConflictException('Cannot delete warehouse with active stock. Transfer or write off inventory first.');
    }

    await this.prisma.warehouse.delete({ where: { id } });
    return { message: 'Warehouse deleted successfully.', id };
  }
}

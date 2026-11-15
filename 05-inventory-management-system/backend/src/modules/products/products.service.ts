import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(organizationId: string, dto: CreateProductDto, userId?: string) {
    const existingSku = await this.prisma.product.findFirst({
      where: {
        organizationId,
        sku: dto.sku.toUpperCase().trim(),
      },
    });

    if (existingSku) {
      throw new ConflictException(`A product with SKU '${dto.sku}' already exists.`);
    }

    const product = await this.prisma.product.create({
      data: {
        organizationId,
        sku: dto.sku.toUpperCase().trim(),
        name: dto.name.trim(),
        barcode: dto.barcode?.trim() || null,
        description: dto.description?.trim() || null,
        category: dto.category?.trim() || 'General',
        unit: dto.unit?.trim() || 'PCS',
        costPrice: dto.costPrice !== undefined ? Number(dto.costPrice) : 0.0,
        sellingPrice: dto.sellingPrice !== undefined ? Number(dto.sellingPrice) : 0.0,
        reorderPoint: dto.reorderPoint !== undefined ? Number(dto.reorderPoint) : 10,
      },
    });

    // Handle initial warehouse intake if specified
    if (dto.initialWarehouseId && dto.initialStock && dto.initialStock > 0) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: dto.initialWarehouseId },
      });
      if (warehouse && warehouse.organizationId === organizationId) {
        await this.prisma.stockLevel.create({
          data: {
            warehouseId: dto.initialWarehouseId,
            productId: product.id,
            quantity: dto.initialStock,
          },
        });

        await this.prisma.movement.create({
          data: {
            organizationId,
            productId: product.id,
            warehouseId: dto.initialWarehouseId,
            type: MovementType.RECEIVING,
            quantityDelta: dto.initialStock,
            previousQuantity: 0,
            resultingQuantity: dto.initialStock,
            reference: 'INITIAL_LOAD',
            notes: 'Initial stock intake upon SKU creation',
            userId: userId || null,
          },
        });
      }
    }

    return this.getProductById(product.id, organizationId);
  }

  async getProducts(organizationId: string, query: QueryProductsDto) {
    const where: any = { organizationId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { barcode: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        stockLevels: {
          include: { warehouse: true },
        },
      },
    });

    const enriched = products.map((prod) => {
      const totalStock = prod.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
      const isLowStock = totalStock <= prod.reorderPoint;
      const totalValuation = Math.round(totalStock * prod.costPrice * 100) / 100;

      return {
        ...prod,
        totalStock,
        isLowStock,
        totalValuation,
      };
    });

    if (query.lowStockOnly) {
      return enriched.filter((p) => p.isLowStock);
    }

    return enriched;
  }

  async getProductById(id: string, organizationId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        stockLevels: {
          include: { warehouse: true },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found.');
    if (product.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    const totalStock = product.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
    const isLowStock = totalStock <= product.reorderPoint;
    const totalValuation = Math.round(totalStock * product.costPrice * 100) / 100;

    return {
      ...product,
      totalStock,
      isLowStock,
      totalValuation,
    };
  }

  async updateProduct(id: string, organizationId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.barcode !== undefined) data.barcode = dto.barcode?.trim() || null;
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.category !== undefined) data.category = dto.category.trim();
    if (dto.unit !== undefined) data.unit = dto.unit.trim();
    if (dto.costPrice !== undefined) data.costPrice = Number(dto.costPrice);
    if (dto.sellingPrice !== undefined) data.sellingPrice = Number(dto.sellingPrice);
    if (dto.reorderPoint !== undefined) data.reorderPoint = Number(dto.reorderPoint);

    await this.prisma.product.update({
      where: { id },
      data,
    });

    return this.getProductById(id, organizationId);
  }

  async deleteProduct(id: string, organizationId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { stockLevels: true },
    });

    if (!product) throw new NotFoundException('Product not found.');
    if (product.organizationId !== organizationId) throw new ForbiddenException('Access denied.');

    const totalStock = product.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
    if (totalStock > 0) {
      throw new ConflictException(`Cannot delete product with ${totalStock} units on hand. Perform an inventory adjustment first.`);
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully.', id };
  }
}

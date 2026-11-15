import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(organizationId: string) {
    const products = await this.prisma.product.findMany({
      where: { organizationId },
      include: { stockLevels: true },
    });

    const warehouses = await this.prisma.warehouse.findMany({
      where: { organizationId },
      include: { stockLevels: true },
    });

    let totalValuation = 0;
    let totalItemsOnHand = 0;
    let lowStockCount = 0;

    for (const p of products) {
      const stock = p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
      totalItemsOnHand += stock;
      totalValuation += stock * p.costPrice;
      if (stock <= p.reorderPoint) {
        lowStockCount++;
      }
    }

    const warehouseBreakdown = warehouses.map((w) => ({
      id: w.id,
      code: w.code,
      name: w.name,
      totalUnits: w.stockLevels.reduce((s, sl) => s + sl.quantity, 0),
      totalSkus: w.stockLevels.length,
    }));

    return {
      totalSkus: products.length,
      totalUnitsOnHand: totalItemsOnHand,
      totalInventoryValuation: Math.round(totalValuation * 100) / 100,
      lowStockItemCount: lowStockCount,
      warehouses: warehouseBreakdown,
    };
  }

  async exportCsv(organizationId: string): Promise<string> {
    const products = await this.prisma.product.findMany({
      where: { organizationId },
      include: {
        stockLevels: { include: { warehouse: true } },
      },
      orderBy: { sku: 'asc' },
    });

    const headers = [
      'SKU',
      'Name',
      'Category',
      'Barcode',
      'Unit',
      'Cost Price',
      'Selling Price',
      'Reorder Point',
      'Total Stock',
      'Total Valuation',
    ];

    const rows = products.map((p) => {
      const totalStock = p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
      const val = Math.round(totalStock * p.costPrice * 100) / 100;
      return [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.barcode || ''}"`,
        `"${p.unit}"`,
        p.costPrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        p.reorderPoint,
        totalStock,
        val.toFixed(2),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  async importCsv(organizationId: string, csvContent: string) {
    const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new BadRequestException('CSV file must contain a header row and at least one data row.');
    }

    let createdCount = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV split matching quotes
      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        const sku = parts[0].toUpperCase();
        const name = parts[1];
        const category = parts[2] || 'General';
        const costPrice = parseFloat(parts[5]) || 0;
        const sellingPrice = parseFloat(parts[6]) || 0;
        const reorderPoint = parseInt(parts[7], 10) || 10;

        const existing = await this.prisma.product.findFirst({
          where: { organizationId, sku },
        });

        if (!existing) {
          await this.prisma.product.create({
            data: {
              organizationId,
              sku,
              name,
              category,
              costPrice,
              sellingPrice,
              reorderPoint,
            },
          });
          createdCount++;
        }
      }
    }

    return {
      message: `Import completed. ${createdCount} new SKUs imported.`,
      importedCount: createdCount,
    };
  }
}

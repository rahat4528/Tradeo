import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async createItem(categoryId: string, restaurantId: string, dto: CreateItemDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { menu: true },
    });

    if (!category) throw new NotFoundException('Category not found.');
    if (category.menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    const item = await this.prisma.menuItem.create({
      data: {
        categoryId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        price: Number(dto.price),
        promoPrice: dto.promoPrice ? Number(dto.promoPrice) : null,
        imageUrl: dto.imageUrl || null,
        calories: dto.calories || null,
        prepTimeMinutes: dto.prepTimeMinutes || null,
        badge: dto.badge || null,
        isAvailable: dto.isAvailable ?? true,
        allergens: dto.allergens || null,
        dietary: dto.dietary || null,
        ingredients: dto.ingredients || null,
      },
    });

    // Handle nested variants
    if (dto.variants && dto.variants.length > 0) {
      for (const vg of dto.variants) {
        const group = await this.prisma.variantGroup.create({
          data: {
            menuItemId: item.id,
            name: vg.name,
            minSelections: vg.minSelections || 1,
            maxSelections: vg.maxSelections || 1,
          },
        });

        if (vg.options && vg.options.length > 0) {
          for (const opt of vg.options) {
            await this.prisma.variantOption.create({
              data: {
                variantGroupId: group.id,
                name: opt.name,
                priceDelta: Number(opt.priceDelta || 0),
              },
            });
          }
        }
      }
    }

    return this.getItemById(item.id);
  }

  async getItemById(id: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: {
          include: { menu: true },
        },
        variantGroups: {
          include: { options: true },
        },
      },
    });

    if (!item) throw new NotFoundException('Item not found.');
    return item;
  }

  async updateItem(id: string, restaurantId: string, dto: UpdateItemDto) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: {
          include: { menu: true },
        },
      },
    });

    if (!item) throw new NotFoundException('Item not found.');
    if (item.category.menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.price !== undefined) data.price = Number(dto.price);
    if (dto.promoPrice !== undefined) data.promoPrice = dto.promoPrice ? Number(dto.promoPrice) : null;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.calories !== undefined) data.calories = dto.calories;
    if (dto.prepTimeMinutes !== undefined) data.prepTimeMinutes = dto.prepTimeMinutes;
    if (dto.badge !== undefined) data.badge = dto.badge;
    if (dto.isAvailable !== undefined) data.isAvailable = dto.isAvailable;
    if (dto.allergens !== undefined) data.allergens = dto.allergens;
    if (dto.dietary !== undefined) data.dietary = dto.dietary;
    if (dto.ingredients !== undefined) data.ingredients = dto.ingredients;

    await this.prisma.menuItem.update({
      where: { id },
      data,
    });

    if (dto.variants !== undefined) {
      // Recreate variant groups
      await this.prisma.variantGroup.deleteMany({
        where: { menuItemId: id },
      });

      for (const vg of dto.variants) {
        const group = await this.prisma.variantGroup.create({
          data: {
            menuItemId: id,
            name: vg.name,
            minSelections: vg.minSelections || 1,
            maxSelections: vg.maxSelections || 1,
          },
        });

        if (vg.options && vg.options.length > 0) {
          for (const opt of vg.options) {
            await this.prisma.variantOption.create({
              data: {
                variantGroupId: group.id,
                name: opt.name,
                priceDelta: Number(opt.priceDelta || 0),
              },
            });
          }
        }
      }
    }

    return this.getItemById(id);
  }

  async toggleAvailability(id: string, restaurantId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: {
          include: { menu: true },
        },
      },
    });

    if (!item) throw new NotFoundException('Item not found.');
    if (item.category.menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
    });
  }

  async deleteItem(id: string, restaurantId: string) {
    const item = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: {
          include: { menu: true },
        },
      },
    });

    if (!item) throw new NotFoundException('Item not found.');
    if (item.category.menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    await this.prisma.menuItem.delete({
      where: { id },
    });

    return { message: 'Menu item deleted successfully.', id };
  }
}

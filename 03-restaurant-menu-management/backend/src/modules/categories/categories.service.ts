import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(menuId: string, restaurantId: string, dto: CreateCategoryDto) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) throw new NotFoundException('Menu not found.');
    if (menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    return this.prisma.category.create({
      data: {
        menuId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  async updateCategory(id: string, restaurantId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { menu: true },
    });

    if (!category) throw new NotFoundException('Category not found.');
    if (category.menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCategory(id: string, restaurantId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { menu: true },
    });

    if (!category) throw new NotFoundException('Category not found.');
    if (category.menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully.', id };
  }
}

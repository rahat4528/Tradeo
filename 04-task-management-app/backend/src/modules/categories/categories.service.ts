import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async createCategory(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name.trim(),
        color: dto.color || '#6366F1',
        icon: dto.icon || 'folder',
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  async getUserCategories(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async updateCategory(id: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied to category.');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : undefined,
        color: dto.color,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async deleteCategory(id: string, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('Access denied to category.');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully.', id };
  }
}

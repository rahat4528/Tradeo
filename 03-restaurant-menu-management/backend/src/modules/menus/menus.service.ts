import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async createMenu(restaurantId: string, dto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: {
        restaurantId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        isPublished: dto.isPublished ?? true,
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        daysOfWeek: dto.daysOfWeek || '0,1,2,3,4,5,6',
        sortOrder: dto.sortOrder || 0,
      },
      include: {
        _count: {
          select: { categories: true },
        },
      },
    });
  }

  async getRestaurantMenus(restaurantId: string) {
    return this.prisma.menu.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              include: {
                variantGroups: {
                  include: { options: true },
                },
              },
            },
          },
        },
        _count: {
          select: { categories: true },
        },
      },
    });
  }

  async getMenuById(id: string, restaurantId: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              include: {
                variantGroups: {
                  include: { options: true },
                },
              },
            },
          },
        },
      },
    });

    if (!menu) throw new NotFoundException('Menu not found.');
    if (menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    return menu;
  }

  async updateMenu(id: string, restaurantId: string, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) throw new NotFoundException('Menu not found.');
    if (menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    return this.prisma.menu.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMenu(id: string, restaurantId: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) throw new NotFoundException('Menu not found.');
    if (menu.restaurantId !== restaurantId) throw new ForbiddenException('Access denied.');

    await this.prisma.menu.delete({
      where: { id },
    });

    return { message: 'Menu deleted successfully.', id };
  }
}

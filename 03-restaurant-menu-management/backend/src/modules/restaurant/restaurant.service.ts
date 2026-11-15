import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  async getRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        _count: {
          select: { menus: true },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant profile not found.');
    }

    return restaurant;
  }

  async updateRestaurant(restaurantId: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: dto,
    });
  }
}

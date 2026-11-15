import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getPublicMenu(slug: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        menus: {
          where: { isPublished: true },
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
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with slug '${slug}' was not found.`);
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMins = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;

    // Decorate each menu with live schedule availability
    const enrichedMenus = restaurant.menus.map((menu) => {
      let isAvailableNow = true;

      // Check day of week
      if (menu.daysOfWeek) {
        const allowedDays = menu.daysOfWeek.split(',').map((d) => parseInt(d.trim(), 10));
        if (!allowedDays.includes(currentDay)) {
          isAvailableNow = false;
        }
      }

      // Check time range
      if (isAvailableNow && menu.startTime && menu.endTime) {
        if (currentTimeStr < menu.startTime || currentTimeStr > menu.endTime) {
          isAvailableNow = false;
        }
      }

      return {
        ...menu,
        isAvailableNow,
      };
    });

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        currency: restaurant.currency,
        address: restaurant.address,
        phone: restaurant.phone,
        headerImageUrl: restaurant.headerImageUrl,
      },
      menus: enrichedMenus,
    };
  }

  async generateQr(slug: string, options: { format?: string; table?: string; size?: number }) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with slug '${slug}' not found.`);
    }

    const frontendUrl = this.configService.get<string>('frontendUrl', 'http://localhost:3002');
    let targetUrl = `${frontendUrl}/m/${slug}`;
    if (options.table) {
      targetUrl += `?table=${encodeURIComponent(options.table)}`;
    }

    const size = options.size || 350;
    const format = options.format || 'svg';

    if (format === 'png') {
      const buffer = await QRCode.toBuffer(targetUrl, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
      });
      return { mimeType: 'image/png', data: buffer };
    }

    const svg = await QRCode.toString(targetUrl, {
      type: 'svg',
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
    return { mimeType: 'image/svg+xml', data: svg };
  }
}

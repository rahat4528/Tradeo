import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';
import * as UAParser from 'ua-parser-js';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async recordClick(
    linkId: string,
    meta: {
      ip?: string;
      userAgent?: string;
      referrer?: string;
      countryHeader?: string;
    },
  ) {
    try {
      // Anonymize IP via SHA-256 with salt
      const salt = 'tradeo-ip-salt-2026';
      const rawIp = meta.ip || '127.0.0.1';
      const ipHash = crypto.createHmac('sha256', salt).update(rawIp).digest('hex').substring(0, 16);

      // Parse User-Agent
      const ua = new UAParser(meta.userAgent || '');
      const browser = ua.getBrowser().name || 'Unknown Browser';
      const os = ua.getOS().name || 'Unknown OS';
      const deviceType = ua.getDevice().type || 'Desktop';
      const device = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

      // Sanitize referrer
      let cleanReferrer = 'Direct';
      if (meta.referrer && meta.referrer.trim() !== '') {
        try {
          const parsed = new URL(meta.referrer);
          cleanReferrer = parsed.hostname;
        } catch {
          cleanReferrer = meta.referrer.substring(0, 50);
        }
      }

      // Geo approximation (from Cloudflare/Fastly header if available, else standard fallback)
      const country = meta.countryHeader || 'US';

      // Check if IP is unique for this link within the last 24h
      const recentClick = await this.prisma.click.findFirst({
        where: {
          linkId,
          ipHash,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      const isUnique = !recentClick;

      // Save click record
      await this.prisma.click.create({
        data: {
          linkId,
          ipHash,
          country,
          referrer: cleanReferrer,
          browser,
          os,
          device,
          isUnique,
        },
      });

      // Increment clickCount on Link atomically
      await this.prisma.link.update({
        where: { id: linkId },
        data: {
          clickCount: {
            increment: 1,
          },
        },
      });
    } catch (err: any) {
      this.logger.error(`Error recording click telemetry for link ${linkId}: ${err.message}`);
    }
  }

  async getLinkAnalytics(linkId: string, userId: string, period: string = '30d') {
    const link = await this.prisma.link.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Link not found.');
    }

    if (link.userId && link.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view analytics for this link.');
    }

    let since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (period === '24h') {
      since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (period === '7d') {
      since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'all') {
      since = new Date(0);
    }

    const clicks = await this.prisma.click.findMany({
      where: {
        linkId,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
    });

    const totalClicks = clicks.length;
    const uniqueClicks = clicks.filter((c) => c.isUnique).length;

    // Aggregate by date (YYYY-MM-DD)
    const clicksByDateMap = new Map<string, number>();
    for (const c of clicks) {
      const dateKey = c.timestamp.toISOString().split('T')[0];
      clicksByDateMap.set(dateKey, (clicksByDateMap.get(dateKey) || 0) + 1);
    }
    const clicksByDate = Array.from(clicksByDateMap.entries()).map(([date, count]) => ({ date, count }));

    // Aggregate referrers
    const referrersMap = new Map<string, number>();
    for (const c of clicks) {
      const ref = c.referrer || 'Direct';
      referrersMap.set(ref, (referrersMap.get(ref) || 0) + 1);
    }
    const referrers = Array.from(referrersMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Aggregate browsers
    const browsersMap = new Map<string, number>();
    for (const c of clicks) {
      const b = c.browser || 'Unknown';
      browsersMap.set(b, (browsersMap.get(b) || 0) + 1);
    }
    const browsers = Array.from(browsersMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Aggregate OS
    const osMap = new Map<string, number>();
    for (const c of clicks) {
      const o = c.os || 'Unknown';
      osMap.set(o, (osMap.get(o) || 0) + 1);
    }
    const os = Array.from(osMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Aggregate Countries
    const countryMap = new Map<string, number>();
    for (const c of clicks) {
      const countryCode = c.country || 'Unknown';
      countryMap.set(countryCode, (countryMap.get(countryCode) || 0) + 1);
    }
    const countries = Array.from(countryMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);

    // Aggregate Devices
    const deviceMap = new Map<string, number>();
    for (const c of clicks) {
      const d = c.device || 'Desktop';
      deviceMap.set(d, (deviceMap.get(d) || 0) + 1);
    }
    const devices = Array.from(deviceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      link: {
        id: link.id,
        slug: link.slug,
        targetUrl: link.targetUrl,
        createdAt: link.createdAt,
      },
      period,
      totalClicks,
      uniqueClicks,
      clicksByDate,
      referrers,
      browsers,
      os,
      countries,
      devices,
    };
  }

  async getUserOverview(userId: string) {
    const userLinks = await this.prisma.link.findMany({
      where: { userId },
      select: { id: true, clickCount: true, createdAt: true },
    });

    const totalLinks = userLinks.length;
    const totalClicks = userLinks.reduce((acc, curr) => acc + curr.clickCount, 0);

    const linkIds = userLinks.map((l) => l.id);
    const recentClicks = await this.prisma.click.findMany({
      where: { linkId: { in: linkIds } },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        link: {
          select: { slug: true, targetUrl: true },
        },
      },
    });

    return {
      totalLinks,
      totalClicks,
      recentClicks,
    };
  }
}

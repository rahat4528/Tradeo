import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchWorkspace(query: string, workspaceId: string) {
    if (!query || !query.trim()) {
      return [];
    }
    const q = query.trim();

    const pages = await this.prisma.page.findMany({
      where: {
        workspaceId,
        isArchived: false,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { blocks: { some: { content: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      select: {
        id: true,
        title: true,
        icon: true,
        updatedAt: true,
      },
      take: 20,
    });

    return pages;
  }
}

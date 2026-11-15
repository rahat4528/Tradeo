import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async getUserTags(userId: string) {
    const tags = await this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { snippets: true },
        },
      },
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      snippetCount: t._count.snippets,
      createdAt: t.createdAt,
    }));
  }
}

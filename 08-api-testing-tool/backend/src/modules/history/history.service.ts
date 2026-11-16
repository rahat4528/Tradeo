import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getHistory(workspaceId: string, limit: number = 50) {
    return this.prisma.requestHistory.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        method: true,
        url: true,
        responseStatus: true,
        responseStatusText: true,
        responseTimeMs: true,
        responseSizeBytes: true,
        createdAt: true,
      },
    });
  }

  async getHistoryDetail(id: string, workspaceId: string) {
    const entry = await this.prisma.requestHistory.findFirst({
      where: { id, workspaceId },
    });
    if (!entry) throw new NotFoundException('History record not found');
    return entry;
  }

  async clearHistory(workspaceId: string) {
    return this.prisma.requestHistory.deleteMany({
      where: { workspaceId },
    });
  }
}

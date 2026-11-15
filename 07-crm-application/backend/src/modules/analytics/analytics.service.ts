import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DealStage } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(organizationId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { organizationId },
      include: {
        company: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    const activeDeals = deals.filter((d) => d.stage !== DealStage.CLOSED_WON && d.stage !== DealStage.CLOSED_LOST);
    const wonDeals = deals.filter((d) => d.stage === DealStage.CLOSED_WON);
    const lostDeals = deals.filter((d) => d.stage === DealStage.CLOSED_LOST);

    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const weightedForecast = activeDeals.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);
    const totalWonRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);

    const closedCount = wonDeals.length + lostDeals.length;
    const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

    const stages: DealStage[] = [
      DealStage.LEAD,
      DealStage.QUALIFIED,
      DealStage.PROPOSAL,
      DealStage.NEGOTIATION,
      DealStage.CLOSED_WON,
      DealStage.CLOSED_LOST,
    ];

    const stageBreakdown = stages.map((stg) => {
      const match = deals.filter((d) => d.stage === stg);
      return {
        stage: stg,
        count: match.length,
        value: Math.round(match.reduce((sum, d) => sum + d.value, 0) * 100) / 100,
      };
    });

    const topOpportunities = activeDeals
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((d) => ({
        id: d.id,
        title: d.title,
        value: d.value,
        stage: d.stage,
        probability: d.probability,
        companyName: d.company?.name || 'Independent Account',
      }));

    return {
      totalDeals: deals.length,
      activeDealsCount: activeDeals.length,
      totalPipelineValue: Math.round(totalPipelineValue * 100) / 100,
      weightedForecast: Math.round(weightedForecast * 100) / 100,
      totalWonRevenue: Math.round(totalWonRevenue * 100) / 100,
      winRatePercentage: winRate,
      stageBreakdown,
      topOpportunities,
    };
  }
}

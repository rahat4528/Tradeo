import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { DealStage } from '@prisma/client';

const STAGE_DEFAULT_PROBABILITIES: Record<DealStage, number> = {
  [DealStage.LEAD]: 10,
  [DealStage.QUALIFIED]: 25,
  [DealStage.PROPOSAL]: 50,
  [DealStage.NEGOTIATION]: 75,
  [DealStage.CLOSED_WON]: 100,
  [DealStage.CLOSED_LOST]: 0,
};

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, ownerId: string, dto: CreateDealDto) {
    const stage = dto.stage || DealStage.LEAD;
    const probability = dto.probability !== undefined ? dto.probability : STAGE_DEFAULT_PROBABILITIES[stage];

    return this.prisma.deal.create({
      data: {
        organizationId,
        ownerId,
        companyId: dto.companyId || null,
        contactId: dto.contactId || null,
        title: dto.title.trim(),
        value: Number(dto.value),
        stage,
        probability,
        closeDate: dto.closeDate ? new Date(dto.closeDate) : null,
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        owner: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(organizationId: string, query?: { stage?: DealStage; ownerId?: string }) {
    const where: any = { organizationId };

    if (query?.stage) {
      where.stage = query.stage;
    }

    if (query?.ownerId) {
      where.ownerId = query.ownerId;
    }

    return this.prisma.deal.findMany({
      where,
      orderBy: { value: 'desc' },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        owner: { select: { id: true, name: true } },
      },
    });
  }

  async findPipelineGrouped(organizationId: string) {
    const deals = await this.findAll(organizationId);

    const stages: DealStage[] = [
      DealStage.LEAD,
      DealStage.QUALIFIED,
      DealStage.PROPOSAL,
      DealStage.NEGOTIATION,
      DealStage.CLOSED_WON,
      DealStage.CLOSED_LOST,
    ];

    const columns = stages.map((stg) => {
      const stageDeals = deals.filter((d) => d.stage === stg);
      const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
      const weightedValue = stageDeals.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);

      return {
        stage: stg,
        dealCount: stageDeals.length,
        totalValue: Math.round(totalValue * 100) / 100,
        weightedValue: Math.round(weightedValue * 100) / 100,
        deals: stageDeals,
      };
    });

    const grandTotal = deals.reduce((sum, d) => sum + d.value, 0);
    const weightedForecast = deals.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);

    return {
      grandTotal: Math.round(grandTotal * 100) / 100,
      weightedForecast: Math.round(weightedForecast * 100) / 100,
      columns,
    };
  }

  async findOne(id: string, organizationId: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
        owner: { select: { id: true, name: true, email: true } },
        activities: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!deal) throw new NotFoundException('Deal not found.');
    if (deal.organizationId !== organizationId) throw new ForbiddenException('Access denied to deal.');

    return deal;
  }

  async updateStage(id: string, organizationId: string, dto: UpdateStageDto) {
    await this.findOne(id, organizationId);
    const probability = STAGE_DEFAULT_PROBABILITIES[dto.stage];

    return this.prisma.deal.update({
      where: { id },
      data: {
        stage: dto.stage,
        probability,
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(id: string, organizationId: string, dto: Partial<CreateDealDto>) {
    await this.findOne(id, organizationId);

    return this.prisma.deal.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title.trim() } : {}),
        ...(dto.value !== undefined ? { value: Number(dto.value) } : {}),
        ...(dto.stage ? { stage: dto.stage, probability: dto.probability !== undefined ? dto.probability : STAGE_DEFAULT_PROBABILITIES[dto.stage] } : {}),
        ...(dto.probability !== undefined && !dto.stage ? { probability: dto.probability } : {}),
        ...(dto.companyId !== undefined ? { companyId: dto.companyId || null } : {}),
        ...(dto.contactId !== undefined ? { contactId: dto.contactId || null } : {}),
        ...(dto.closeDate !== undefined ? { closeDate: dto.closeDate ? new Date(dto.closeDate) : null } : {}),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.deal.delete({ where: { id } });
  }
}

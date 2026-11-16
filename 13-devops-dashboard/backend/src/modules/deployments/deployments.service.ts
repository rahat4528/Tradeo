import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { Environment } from '@prisma/client';

@Injectable()
export class DeploymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeploymentDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service ${dto.serviceId} not found`);
    }

    return this.prisma.deployment.create({
      data: {
        serviceId: dto.serviceId,
        version: dto.version,
        commitSha: dto.commitSha,
        branch: dto.branch || 'main',
        environment: dto.environment || Environment.PRODUCTION,
        deployer: dto.deployer || 'GitHub Actions',
        status: dto.status || 'SUCCESS',
        durationSeconds: dto.durationSeconds || null,
      },
      include: { service: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.deployment.findMany({
      where: { service: { userId } },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

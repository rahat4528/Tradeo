import { Module } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { DeploymentsController } from './deployments.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [DeploymentsController],
  providers: [DeploymentsService, PrismaService],
  exports: [DeploymentsService],
})
export class DeploymentsModule {}

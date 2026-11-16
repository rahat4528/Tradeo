import { Module } from '@nestjs/common';
import { SwimlanesService } from './swimlanes.service';
import { SwimlanesController } from './swimlanes.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SwimlanesController],
  providers: [SwimlanesService, PrismaService],
  exports: [SwimlanesService],
})
export class SwimlanesModule {}

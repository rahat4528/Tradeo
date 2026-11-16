import { Module } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [BlocksController],
  providers: [BlocksService, PrismaService],
  exports: [BlocksService],
})
export class BlocksModule {}

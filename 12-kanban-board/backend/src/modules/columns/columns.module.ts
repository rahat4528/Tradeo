import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ColumnsController],
  providers: [ColumnsService, PrismaService],
  exports: [ColumnsService],
})
export class ColumnsModule {}

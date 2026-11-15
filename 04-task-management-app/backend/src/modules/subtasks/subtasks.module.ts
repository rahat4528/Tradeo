import { Module } from '@nestjs/common';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SubtasksController],
  providers: [SubtasksService, PrismaService],
  exports: [SubtasksService],
})
export class SubtasksModule {}

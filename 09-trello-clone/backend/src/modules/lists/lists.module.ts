import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { PrismaService } from '../../database/prisma.service';
import { BoardGateway } from '../gateway/board.gateway';

@Module({
  controllers: [ListsController],
  providers: [ListsService, PrismaService, BoardGateway],
  exports: [ListsService],
})
export class ListsModule {}

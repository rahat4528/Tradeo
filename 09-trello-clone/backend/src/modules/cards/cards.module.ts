import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { PrismaService } from '../../database/prisma.service';
import { BoardGateway } from '../gateway/board.gateway';

@Module({
  controllers: [CardsController],
  providers: [CardsService, PrismaService, BoardGateway],
  exports: [CardsService],
})
export class CardsModule {}

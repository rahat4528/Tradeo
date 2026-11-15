import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [PublicController],
  providers: [PublicService, PrismaService],
  exports: [PublicService],
})
export class PublicModule {}

import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { PrismaService } from '../../database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';
import { AbuseService } from '../abuse/abuse.service';

@Module({
  controllers: [LinksController],
  providers: [LinksService, PrismaService, CacheService, AbuseService],
  exports: [LinksService],
})
export class LinksModule {}

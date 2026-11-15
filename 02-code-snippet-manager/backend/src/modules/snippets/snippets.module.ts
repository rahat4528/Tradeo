import { Module } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [SnippetsController],
  providers: [SnippetsService, PrismaService],
  exports: [SnippetsService],
})
export class SnippetsModule {}

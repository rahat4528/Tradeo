import { Module } from '@nestjs/common';
import { ExportImportService } from './export-import.service';
import { ExportImportController } from './export-import.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ExportImportController],
  providers: [ExportImportService, PrismaService],
  exports: [ExportImportService],
})
export class ExportImportModule {}

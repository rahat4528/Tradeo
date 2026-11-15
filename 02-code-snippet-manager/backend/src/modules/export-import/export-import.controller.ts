import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportImportService } from './export-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Export & Import')
@Controller('export-import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportImportController {
  constructor(private exportImportService: ExportImportService) {}

  @Get('export')
  @ApiOperation({ summary: 'Export user snippet workspace as structured JSON' })
  async exportAll(@Req() req: any) {
    return this.exportImportService.exportAll(req.user.id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import snippets into user workspace from JSON' })
  async importSnippets(@Body() data: any, @Req() req: any) {
    return this.exportImportService.importSnippets(req.user.id, data);
  }
}

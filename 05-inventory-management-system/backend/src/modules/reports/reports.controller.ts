import { Controller, Get, Post, Body, Res, UseGuards, Req, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reports, Analytics & CSV')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get total valuation, SKU counts, and warehouse breakdown' })
  async getSummary(@Req() req: any) {
    return this.reportsService.getSummary(req.user.organizationId);
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Export full stock ledger and catalog as CSV' })
  async exportCsv(@Req() req: any, @Res() res: Response) {
    const csv = await this.reportsService.exportCsv(req.user.organizationId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-stock-export.csv"');
    return res.status(HttpStatus.OK).send(csv);
  }

  @Post('import-csv')
  @ApiOperation({ summary: 'Bulk import products from CSV content' })
  async importCsv(@Req() req: any, @Body('csvContent') csvContent: string) {
    return this.reportsService.importCsv(req.user.organizationId, csvContent);
  }
}

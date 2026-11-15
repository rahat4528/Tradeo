import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MovementsService } from './movements.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Inventory Movements & Ledger')
@Controller('movements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Post('adjust')
  @ApiOperation({ summary: 'Apply manual cycle count or scrap stock adjustment' })
  async adjustStock(@Req() req: any, @Body() dto: AdjustStockDto) {
    return this.movementsService.adjustStock(req.user.organizationId, req.user.id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Execute inter-warehouse stock transfer' })
  async transferStock(@Req() req: any, @Body() dto: TransferStockDto) {
    return this.movementsService.transferStock(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve recent inventory movement audit records' })
  async getMovements(@Req() req: any, @Query('limit') limit?: string) {
    const numLimit = limit ? parseInt(limit, 10) : 50;
    return this.movementsService.getMovements(req.user.organizationId, numLimit);
  }
}

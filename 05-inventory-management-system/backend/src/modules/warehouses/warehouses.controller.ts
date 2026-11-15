import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Warehouses & Facilities')
@Controller('warehouses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WarehousesController {
  constructor(private warehousesService: WarehousesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new warehouse facility' })
  async createWarehouse(@Req() req: any, @Body() dto: CreateWarehouseDto) {
    return this.warehousesService.createWarehouse(req.user.organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all warehouses with stock metrics' })
  async getWarehouses(@Req() req: any) {
    return this.warehousesService.getWarehouses(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse details and facility stock list' })
  async getWarehouseById(@Param('id') id: string, @Req() req: any) {
    return this.warehousesService.getWarehouseById(id, req.user.organizationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an empty warehouse' })
  async deleteWarehouse(@Param('id') id: string, @Req() req: any) {
    return this.warehousesService.deleteWarehouse(id, req.user.organizationId);
  }
}

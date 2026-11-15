import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Suppliers & Purchase Orders')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a supplier vendor profile' })
  async createSupplier(@Req() req: any, @Body() body: any) {
    return this.suppliersService.createSupplier(req.user.organizationId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  async getSuppliers(@Req() req: any) {
    return this.suppliersService.getSuppliers(req.user.organizationId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create purchase order for vendor' })
  async createPurchaseOrder(@Req() req: any, @Body() body: any) {
    return this.suppliersService.createPurchaseOrder(req.user.organizationId, body);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List purchase orders' })
  async getPurchaseOrders(@Req() req: any) {
    return this.suppliersService.getPurchaseOrders(req.user.organizationId);
  }

  @Post('orders/:id/receive')
  @ApiOperation({ summary: 'Receive goods from purchase order into warehouse' })
  async receivePurchaseOrder(@Param('id') id: string, @Req() req: any) {
    return this.suppliersService.receivePurchaseOrder(id, req.user.organizationId, req.user.id);
  }
}

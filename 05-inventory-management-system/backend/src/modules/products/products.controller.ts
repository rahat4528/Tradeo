import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Products & SKUs')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new product SKU with reorder parameters' })
  async createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    return this.productsService.createProduct(req.user.organizationId, dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List and search products with aggregated stock counts and low-stock filters' })
  async getProducts(@Req() req: any, @Query() query: QueryProductsDto) {
    return this.productsService.getProducts(req.user.organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product profile and per-warehouse inventory breakdown' })
  async getProductById(@Param('id') id: string, @Req() req: any) {
    return this.productsService.getProductById(id, req.user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product metadata, pricing, or reorder point' })
  async updateProduct(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, req.user.organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product with zero stock balance' })
  async deleteProduct(@Param('id') id: string, @Req() req: any) {
    return this.productsService.deleteProduct(id, req.user.organizationId);
  }
}

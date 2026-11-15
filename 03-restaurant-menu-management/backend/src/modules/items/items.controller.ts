import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Menu Items')
@Controller('items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ItemsController {
  constructor(private itemsService: ItemsService) {}

  @Post(':categoryId')
  @ApiOperation({ summary: 'Create a new dish / menu item under category' })
  async createItem(
    @Param('categoryId') categoryId: string,
    @Req() req: any,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemsService.createItem(categoryId, req.user.restaurantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dish details, prices, variants, or availability' })
  async updateItem(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.updateItem(id, req.user.restaurantId, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Instant toggle of 86 / Sold-Out availability' })
  async toggleAvailability(@Param('id') id: string, @Req() req: any) {
    return this.itemsService.toggleAvailability(id, req.user.restaurantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item' })
  async deleteItem(@Param('id') id: string, @Req() req: any) {
    return this.itemsService.deleteItem(id, req.user.restaurantId);
  }
}

import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Menus')
@Controller('menus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu' })
  async createMenu(@Req() req: any, @Body() dto: CreateMenuDto) {
    return this.menusService.createMenu(req.user.restaurantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all menus for the authenticated restaurant' })
  async getRestaurantMenus(@Req() req: any) {
    return this.menusService.getRestaurantMenus(req.user.restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu details with categories and dishes' })
  async getMenuById(@Param('id') id: string, @Req() req: any) {
    return this.menusService.getMenuById(id, req.user.restaurantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update menu metadata, publishing status, or schedules' })
  async updateMenu(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateMenuDto) {
    return this.menusService.updateMenu(id, req.user.restaurantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu' })
  async deleteMenu(@Param('id') id: string, @Req() req: any) {
    return this.menusService.deleteMenu(id, req.user.restaurantId);
  }
}

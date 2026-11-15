import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post(':menuId')
  @ApiOperation({ summary: 'Create a new category inside a menu' })
  async createCategory(
    @Param('menuId') menuId: string,
    @Req() req: any,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(menuId, req.user.restaurantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category details or order' })
  async updateCategory(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, req.user.restaurantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.deleteCategory(id, req.user.restaurantId);
  }
}

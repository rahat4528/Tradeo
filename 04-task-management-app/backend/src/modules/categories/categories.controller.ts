import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categories & Projects')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task category' })
  async createCategory(@Req() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories for the authenticated user' })
  async getUserCategories(@Req() req: any) {
    return this.categoriesService.getUserCategories(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category name, icon, or color' })
  async updateCategory(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.deleteCategory(id, req.user.id);
  }
}

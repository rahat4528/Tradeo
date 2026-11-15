import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SnippetsService } from './snippets.service';
import { CreateSnippetDto } from './dto/create-snippet.dto';
import { UpdateSnippetDto } from './dto/update-snippet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Snippets')
@Controller('snippets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SnippetsController {
  constructor(private snippetsService: SnippetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new code snippet' })
  async createSnippet(@Body() dto: CreateSnippetDto, @Req() req: any) {
    return this.snippetsService.createSnippet(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List and search workspace snippets with faceted filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'language', required: false })
  @ApiQuery({ name: 'folderId', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'isFavorite', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  async getSnippets(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('language') language?: string,
    @Query('folderId') folderId?: string,
    @Query('tag') tag?: string,
    @Query('isFavorite') isFavorite?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const isFav = isFavorite !== undefined ? isFavorite === 'true' : undefined;
    return this.snippetsService.getSnippets(req.user.id, {
      search,
      language,
      folderId,
      tag,
      isFavorite: isFav,
      page,
      limit,
      sortBy,
      order,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve full snippet details' })
  async getSnippetById(@Param('id') id: string, @Req() req: any) {
    return this.snippetsService.getSnippetById(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update snippet content or metadata (records revision)' })
  async updateSnippet(@Param('id') id: string, @Body() dto: UpdateSnippetDto, @Req() req: any) {
    return this.snippetsService.updateSnippet(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a snippet' })
  async deleteSnippet(@Param('id') id: string, @Req() req: any) {
    return this.snippetsService.deleteSnippet(id, req.user.id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get revision history snapshots for a snippet' })
  async getVersionHistory(@Param('id') id: string, @Req() req: any) {
    return this.snippetsService.getVersionHistory(id, req.user.id);
  }

  @Post(':id/rollback/:versionId')
  @ApiOperation({ summary: 'Rollback snippet to a specific historical revision' })
  async rollbackVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Req() req: any,
  ) {
    return this.snippetsService.rollbackVersion(id, versionId, req.user.id);
  }
}

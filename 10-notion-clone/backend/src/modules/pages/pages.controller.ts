import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pages')
export class PagesController {
  constructor(private service: PagesService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.service.listPages(user.workspaceId);
  }

  @Get('trash')
  trash(@CurrentUser() user: any) {
    return this.service.listTrash(user.workspaceId);
  }

  @Post()
  create(@Body() dto: CreatePageDto, @CurrentUser() user: any) {
    return this.service.createPage(dto, user.userId, user.workspaceId);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getPage(id, user.workspaceId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updatePage(id, dto, user.workspaceId);
  }

  @Put(':id/restore')
  restore(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.restorePage(id, user.workspaceId);
  }

  @Delete(':id/permanent')
  deletePermanent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.deletePermanent(id, user.workspaceId);
  }

  @Delete(':id')
  moveToTrash(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.updatePage(id, { isArchived: true }, user.workspaceId);
  }

  @Get(':id/export')
  export(
    @Param('id') id: string,
    @Query('format') format: 'markdown' | 'html',
    @CurrentUser() user: any,
  ) {
    return this.service.exportPage(id, format || 'markdown', user.workspaceId);
  }
}

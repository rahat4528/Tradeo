import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { SaveRequestDto } from './dto/save-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('collections')
export class CollectionsController {
  constructor(private service: CollectionsService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.service.listCollections(user.workspaceId);
  }

  @Post()
  createCollection(@Body() dto: CreateCollectionDto, @CurrentUser() user: any) {
    return this.service.createCollection(dto, user.workspaceId);
  }

  @Get('export')
  exportCollections(@CurrentUser() user: any) {
    return this.service.exportCollections(user.workspaceId);
  }

  @Post('import')
  importCollections(@Body() data: any, @CurrentUser() user: any) {
    return this.service.importCollections(data, user.workspaceId);
  }

  @Get(':id')
  getCollection(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getCollection(id, user.workspaceId);
  }

  @Delete(':id')
  deleteCollection(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.deleteCollection(id, user.workspaceId);
  }

  @Post('requests')
  saveRequest(@Body() dto: SaveRequestDto, @CurrentUser() user: any) {
    return this.service.saveRequest(dto, user.workspaceId);
  }

  @Put('requests/:id')
  updateRequest(
    @Param('id') id: string,
    @Body() dto: Partial<SaveRequestDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.updateRequest(id, dto, user.workspaceId);
  }

  @Delete('requests/:id')
  deleteRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.deleteRequest(id, user.workspaceId);
  }
}

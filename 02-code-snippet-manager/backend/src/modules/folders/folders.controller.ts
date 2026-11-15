import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Folders')
@Controller('folders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoldersController {
  constructor(private foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder in workspace' })
  async createFolder(@Body() dto: CreateFolderDto, @Req() req: any) {
    return this.foldersService.createFolder(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all folders in workspace' })
  async getUserFolders(@Req() req: any) {
    return this.foldersService.getUserFolders(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update or move a folder' })
  async updateFolder(@Param('id') id: string, @Body() dto: UpdateFolderDto, @Req() req: any) {
    return this.foldersService.updateFolder(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a folder' })
  async deleteFolder(@Param('id') id: string, @Req() req: any) {
    return this.foldersService.deleteFolder(id, req.user.id);
  }
}

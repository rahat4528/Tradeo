import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contacts & People')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new business contact' })
  async create(@Req() req: any, @Body() dto: CreateContactDto) {
    return this.contactsService.create(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter contacts' })
  async findAll(@Req() req: any, @Query('search') search?: string, @Query('companyId') companyId?: string) {
    return this.contactsService.findAll(req.user.organizationId, { search, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact profile with associated company and timeline' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.contactsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact details' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateContactDto>) {
    return this.contactsService.update(id, req.user.organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.contactsService.remove(id, req.user.organizationId);
  }
}

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Companies & Accounts')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new target company / client account' })
  async create(@Req() req: any, @Body() dto: CreateCompanyDto) {
    return this.companiesService.create(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter companies' })
  async findAll(@Req() req: any, @Query('search') search?: string, @Query('industry') industry?: string) {
    return this.companiesService.findAll(req.user.organizationId, { search, industry });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single company details with contacts and deals' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.companiesService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company properties' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateCompanyDto>) {
    return this.companiesService.update(id, req.user.organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company account' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.companiesService.remove(id, req.user.organizationId);
  }
}

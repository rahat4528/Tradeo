import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DealStage } from '@prisma/client';

@ApiTags('Deals & Sales Funnel')
@Controller('deals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new sales deal opportunity' })
  async create(@Req() req: any, @Body() dto: CreateDealDto) {
    return this.dealsService.create(req.user.organizationId, req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List deals with optional stage or owner filters' })
  async findAll(@Req() req: any, @Query('stage') stage?: DealStage, @Query('ownerId') ownerId?: string) {
    return this.dealsService.findAll(req.user.organizationId, { stage, ownerId });
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get visual pipeline columns partitioned by stage with value totals' })
  async findPipeline(@Req() req: any) {
    return this.dealsService.findPipelineGrouped(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal details, company, contact, timeline notes, and tasks' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.dealsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Advance or transition deal stage in sales pipeline' })
  async updateStage(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.dealsService.updateStage(id, req.user.organizationId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deal attributes' })
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateDealDto>) {
    return this.dealsService.update(id, req.user.organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete deal opportunity' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.dealsService.remove(id, req.user.organizationId);
  }
}

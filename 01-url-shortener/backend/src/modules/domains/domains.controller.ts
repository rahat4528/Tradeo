import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Custom Domains')
@Controller('domains')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DomainsController {
  constructor(private domainsService: DomainsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a custom domain' })
  async createDomain(@Body() dto: CreateDomainDto, @Req() req: any) {
    return this.domainsService.createDomain(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List custom domains owned by user' })
  async getUserDomains(@Req() req: any) {
    return this.domainsService.getUserDomains(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom domain' })
  async deleteDomain(@Param('id') id: string, @Req() req: any) {
    return this.domainsService.deleteDomain(id, req.user.id);
  }
}

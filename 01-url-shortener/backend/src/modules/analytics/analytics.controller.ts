import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Retrieve high-level click telemetry overview for user' })
  async getOverview(@Req() req: any) {
    return this.analyticsService.getUserOverview(req.user.id);
  }

  @Get('links/:id')
  @ApiOperation({ summary: 'Retrieve detailed analytical reports for a specific link' })
  @ApiQuery({ name: 'period', required: false, enum: ['24h', '7d', '30d', 'all'] })
  async getLinkAnalytics(
    @Param('id') id: string,
    @Query('period') period: string = '30d',
    @Req() req: any,
  ) {
    return this.analyticsService.getLinkAnalytics(id, req.user.id, period);
  }
}

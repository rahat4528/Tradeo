import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('services/:serviceId/metrics')
  create(@Param('serviceId') serviceId: string, @Body() dto: CreateMetricDto) {
    return this.metricsService.create(serviceId, dto);
  }

  @Get('services/:serviceId/metrics')
  getServiceMetrics(@Param('serviceId') serviceId: string, @Query('limit') limit?: string) {
    return this.metricsService.getServiceMetrics(serviceId, limit ? parseInt(limit, 10) : 24);
  }

  @Get('metrics/summary')
  getSummary(@CurrentUser() user: any) {
    return this.metricsService.getSummary(user.id);
  }
}

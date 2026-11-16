import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('boards/:boardId/analytics')
  getBoardAnalytics(@Param('boardId') boardId: string) {
    return this.analyticsService.getBoardAnalytics(boardId);
  }
}

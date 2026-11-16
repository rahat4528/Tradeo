import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private service: HistoryService) {}

  @Get()
  getHistory(@CurrentUser() user: any, @Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 50;
    return this.service.getHistory(user.workspaceId, take);
  }

  @Get(':id')
  getHistoryDetail(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.getHistoryDetail(id, user.workspaceId);
  }

  @Delete()
  clearHistory(@CurrentUser() user: any) {
    return this.service.clearHistory(user.workspaceId);
  }
}

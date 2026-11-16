import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LogLevel } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() dto: CreateLogDto) {
    return this.logsService.create(dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('serviceId') serviceId?: string,
    @Query('level') level?: LogLevel,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.logsService.findAll(user.id, {
      serviceId,
      level,
      search,
      limit: limit ? parseInt(limit, 10) : 100,
    });
  }
}

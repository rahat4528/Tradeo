import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { DispatchRequestDto } from './dto/dispatch-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('proxy')
export class ProxyController {
  constructor(private proxyService: ProxyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('dispatch')
  dispatch(@Body() dto: DispatchRequestDto, @CurrentUser() user: any) {
    return this.proxyService.dispatch(dto, user.workspaceId);
  }
}

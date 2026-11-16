import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('environments')
export class EnvironmentsController {
  constructor(private service: EnvironmentsService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.service.listEnvironments(user.workspaceId);
  }

  @Post()
  create(@Body() dto: CreateEnvironmentDto, @CurrentUser() user: any) {
    return this.service.createEnvironment(dto, user.workspaceId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateEnvironmentDto>,
    @CurrentUser() user: any,
  ) {
    return this.service.updateEnvironment(id, dto, user.workspaceId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.deleteEnvironment(id, user.workspaceId);
  }
}

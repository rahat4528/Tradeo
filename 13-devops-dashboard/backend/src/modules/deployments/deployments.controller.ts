import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('deployments')
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Post()
  create(@Body() dto: CreateDeploymentDto) {
    return this.deploymentsService.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.deploymentsService.findAll(user.id);
  }
}

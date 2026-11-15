import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Restaurant Profile')
@Controller('restaurant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve restaurant profile for authenticated operator' })
  async getRestaurant(@Req() req: any) {
    return this.restaurantService.getRestaurant(req.user.restaurantId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update restaurant details and branding' })
  async updateRestaurant(@Req() req: any, @Body() dto: UpdateRestaurantDto) {
    return this.restaurantService.updateRestaurant(req.user.restaurantId, dto);
  }
}

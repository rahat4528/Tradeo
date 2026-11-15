import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { MenusModule } from './modules/menus/menus.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ItemsModule } from './modules/items/items.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    RestaurantModule,
    MenusModule,
    CategoriesModule,
    ItemsModule,
    PublicModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

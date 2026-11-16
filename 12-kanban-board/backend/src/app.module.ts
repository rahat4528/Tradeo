import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { BoardsModule } from './modules/boards/boards.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { SwimlanesModule } from './modules/swimlanes/swimlanes.module';
import { CardsModule } from './modules/cards/cards.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    BoardsModule,
    ColumnsModule,
    SwimlanesModule,
    CardsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}

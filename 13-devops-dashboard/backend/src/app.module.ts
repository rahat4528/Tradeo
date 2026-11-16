import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { ServicesModule } from './modules/services/services.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { LogsModule } from './modules/logs/logs.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    ServicesModule,
    MetricsModule,
    AlertsModule,
    IncidentsModule,
    DeploymentsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}

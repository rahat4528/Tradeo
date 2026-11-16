import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { EnvironmentsModule } from './modules/environments/environments.module';
import { HistoryModule } from './modules/history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    ProxyModule,
    CollectionsModule,
    EnvironmentsModule,
    HistoryModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

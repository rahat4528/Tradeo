import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { PrismaService } from './database/prisma.service';
import { CacheService } from './common/cache/cache.service';
import { AbuseService } from './modules/abuse/abuse.service';
import { AuthModule } from './modules/auth/auth.module';
import { LinksModule } from './modules/links/links.module';
import { RedirectModule } from './modules/redirect/redirect.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { QrModule } from './modules/qr/qr.module';
import { DomainsModule } from './modules/domains/domains.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('rateLimit.ttl', 60) * 1000,
          limit: config.get<number>('rateLimit.max', 100),
        },
      ],
    }),
    AuthModule,
    LinksModule,
    RedirectModule,
    AnalyticsModule,
    QrModule,
    DomainsModule,
  ],
  providers: [
    PrismaService,
    CacheService,
    AbuseService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

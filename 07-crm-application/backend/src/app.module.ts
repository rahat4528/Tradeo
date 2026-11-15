import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { DealsModule } from './modules/deals/deals.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AuthModule,
    CompaniesModule,
    ContactsModule,
    DealsModule,
    ActivitiesModule,
    AnalyticsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

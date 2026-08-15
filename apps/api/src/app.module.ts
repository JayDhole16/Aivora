import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { SecretsModule } from './secrets/secrets.module';
import { BusinessProfileModule } from './business-profile/business-profile.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { VoiceModule } from './voice/voice.module';
import { CredentialsModule } from './credentials/credentials.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    TenancyModule,
    SecretsModule,
    BusinessProfileModule,
    KnowledgeBaseModule,
    AppointmentsModule,
    VoiceModule,
    CredentialsModule,
    AuditModule,
    HealthModule,
    NotificationsModule,
  ],
})
export class AppModule {}
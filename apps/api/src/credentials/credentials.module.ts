import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { SecretsModule } from '../secrets/secrets.module';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [SecretsModule, PrismaModule],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
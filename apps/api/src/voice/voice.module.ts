import { Module } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { VoiceController } from './voice.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { SecretsModule } from '../secrets/secrets.module';

@Module({
  imports: [PrismaModule, CredentialsModule, SecretsModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
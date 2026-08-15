import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecretsService } from './secrets.service';
import { LocalAesGcmSecretsProvider } from './local-aes-gcm.provider';
import { AwsKmsSecretsProvider } from './aws-kms.provider';
import { SECRETS_PROVIDER_TOKEN, SecretsProviderConfig } from './secrets.provider';
import { PrismaModule } from '../common/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    SecretsService,
    {
      provide: SECRETS_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService): SecretsProviderConfig => ({
        type: (configService.get('SECRETS_PROVIDER') as 'local' | 'aws_kms') || 'local',
        local: {
          masterKey: configService.get('SECRETS_MASTER_KEY') || '',
        },
        awsKms: {
          region: configService.get('AWS_KMS_REGION') || '',
          keyId: configService.get('AWS_KMS_KEY_ID') || '',
        },
      }),
      inject: [ConfigService],
    },
    {
      provide: 'SecretsProvider',
      useFactory: (
        config: SecretsProviderConfig,
        localProvider: LocalAesGcmSecretsProvider,
        awsProvider: AwsKmsSecretsProvider,
      ) => {
        return config.type === 'aws_kms' ? awsProvider : localProvider;
      },
      inject: [SECRETS_PROVIDER_TOKEN, LocalAesGcmSecretsProvider, AwsKmsSecretsProvider],
    },
    LocalAesGcmSecretsProvider,
    AwsKmsSecretsProvider,
  ],
  exports: [SecretsService, 'SecretsProvider'],
})
export class SecretsModule {}
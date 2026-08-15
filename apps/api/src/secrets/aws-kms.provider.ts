import { Injectable } from '@nestjs/common';
import { SecretsProvider, SECRETS_PROVIDER_TOKEN, SecretsProviderConfig } from './secrets.provider';

@Injectable()
export class AwsKmsSecretsProvider implements SecretsProvider {
  constructor(
    @Inject(SECRETS_PROVIDER_TOKEN) private readonly config: SecretsProviderConfig,
  ) {
    if (!config.awsKms?.region || !config.awsKms?.keyId) {
      throw new Error('AWS KMS provider not configured - set AWS_KMS_REGION and AWS_KMS_KEY_ID');
    }
  }

  async store(value: string): Promise<string> {
    throw new Error('AWS KMS provider not implemented - configure AWS credentials to enable');
  }

  async retrieve(ref: string): Promise<string> {
    throw new Error('AWS KMS provider not implemented - configure AWS credentials to enable');
  }

  async revoke(ref: string): Promise<void> {
    throw new Error('AWS KMS provider not implemented - configure AWS credentials to enable');
  }
}
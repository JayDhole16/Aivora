export interface SecretsProvider {
  store(value: string): Promise<string>;
  retrieve(ref: string): Promise<string>;
  revoke(ref: string): Promise<void>;
}

export interface SecretsProviderConfig {
  type: 'local' | 'aws_kms';
  local?: {
    masterKey: string;
  };
  awsKms?: {
    region: string;
    keyId: string;
  };
}

export const SECRETS_PROVIDER_TOKEN = 'SECRETS_PROVIDER';
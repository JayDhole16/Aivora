import { Injectable, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { SecretsProvider, SECRETS_PROVIDER_TOKEN, SecretsProviderConfig } from './secrets.provider';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class LocalAesGcmSecretsProvider implements SecretsProvider {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 12;
  private readonly tagLength = 16;
  private readonly masterKey: Buffer;

  constructor(
    @Inject(SECRETS_PROVIDER_TOKEN) private readonly config: SecretsProviderConfig,
    private readonly prisma: PrismaService,
  ) {
    const masterKeyHex = config.local?.masterKey;
    if (!masterKeyHex) {
      throw new Error('SECRETS_MASTER_KEY is required for LocalAesGcmSecretsProvider');
    }
    this.masterKey = Buffer.from(masterKeyHex, 'hex');
    if (this.masterKey.length !== this.keyLength) {
      throw new Error('SECRETS_MASTER_KEY must be 32 bytes (64 hex characters)');
    }
  }

  async store(value: string): Promise<string> {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    
    const authTag = cipher.getAuthTag();
    
    const combined = Buffer.concat([iv, encrypted, authTag]);
    const ref = `local_aes_gcm_${combined.toString('base64')}`;
    
    await this.prisma.secretStore.create({
      data: {
        ref,
        ciphertext: combined,
      },
    });
    
    return ref;
  }

  async retrieve(ref: string): Promise<string> {
    if (!ref.startsWith('local_aes_gcm_')) {
      throw new Error('Invalid secret reference format');
    }
    
    const stored = await this.prisma.secretStore.findUnique({
      where: { ref },
    });
    
    if (!stored) {
      throw new Error('Secret not found');
    }
    
    const combined = stored.ciphertext;
    const iv = combined.subarray(0, this.ivLength);
    const encrypted = combined.subarray(this.ivLength, combined.length - this.tagLength);
    const authTag = combined.subarray(combined.length - this.tagLength);
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted.toString('utf8');
  }

  async revoke(ref: string): Promise<void> {
    await this.prisma.secretStore.delete({
      where: { ref },
    });
  }
}
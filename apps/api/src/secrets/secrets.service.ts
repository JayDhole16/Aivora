import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { SecretsProvider, SECRETS_PROVIDER_TOKEN } from './secrets.provider';

@Injectable()
export class SecretsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(SECRETS_PROVIDER_TOKEN) private readonly provider: SecretsProvider,
  ) {}

  async store(orgId: string, value: string): Promise<string> {
    const ref = await this.provider.store(value);
    
    await this.prisma.secretStore.create({
      data: {
        orgId,
        ref,
        ciphertext: Buffer.from(''), // Placeholder, actual ciphertext stored by provider
      },
    });
    
    return ref;
  }

  async retrieve(orgId: string, ref: string): Promise<string> {
    const secretStore = await this.prisma.secretStore.findUnique({
      where: { ref },
    });

    if (!secretStore || secretStore.orgId !== orgId) {
      throw new NotFoundException('Secret not found');
    }

    return this.provider.retrieve(ref);
  }

  async revoke(orgId: string, ref: string): Promise<void> {
    const secretStore = await this.prisma.secretStore.findUnique({
      where: { ref },
    });

    if (!secretStore || secretStore.orgId !== orgId) {
      throw new NotFoundException('Secret not found');
    }

    await this.provider.revoke(ref);
    await this.prisma.secretStore.delete({ where: { ref } });
  }

  getProviderType(): string {
    const providerType = this.configService.get('SECRETS_PROVIDER') || 'local';
    return providerType;
  }
}
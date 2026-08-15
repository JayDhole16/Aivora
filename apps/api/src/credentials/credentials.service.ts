import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SecretsService } from '../secrets/secrets.service';
import { CredentialType } from '@aivora/shared-types';
import { CreateCredentialDto, UpdateCredentialDto, TestCredentialDto } from './dto/credential.dto';
import { CredentialValidator, CREDENTIAL_VALIDATORS } from './credential-validators';

@Injectable()
export class CredentialsService {
  private validators: Map<CredentialType, CredentialValidator> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly secretsService: SecretsService,
  ) {
    this.initializeValidators();
  }

  private initializeValidators() {
    this.validators.set(CredentialType.twilio, new (require('./credential-validators').TwilioCredentialValidator)());
    this.validators.set(CredentialType.openai, new (require('./credential-validators').OpenAICredentialValidator)());
    this.validators.set(CredentialType.deepgram, new (require('./credential-validators').DeepgramCredentialValidator)());
    this.validators.set(CredentialType.elevenlabs, new (require('./credential-validators').ElevenLabsCredentialValidator)());
    this.validators.set(CredentialType.google_calendar, new (require('./credential-validators').GoogleCalendarCredentialValidator)());
    this.validators.set(CredentialType.meta_whatsapp, new (require('./credential-validators').NotImplementedCredentialValidator)(CredentialType.meta_whatsapp));
    this.validators.set(CredentialType.anthropic, new (require('./credential-validators').NotImplementedCredentialValidator)(CredentialType.anthropic));
    this.validators.set(CredentialType.azure_tts, new (require('./credential-validators').NotImplementedCredentialValidator)(CredentialType.azure_tts));
    this.validators.set(CredentialType.outlook_calendar, new (require('./credential-validators').NotImplementedCredentialValidator)(CredentialType.outlook_calendar));
    this.validators.set(CredentialType.s3_storage, new (require('./credential-validators').NotImplementedCredentialValidator)(CredentialType.s3_storage));
    this.validators.set(CredentialType.other, new (require('./credential-validators').NotImplementedCredentialValidator)(CredentialType.other));
  }

  async create(orgId: string, userId: string, dto: CreateCredentialDto) {
    const secretRef = await this.secretsService.store(orgId, JSON.stringify(dto.secret));

    const credential = await this.prisma.credential.create({
      data: {
        orgId,
        type: dto.type,
        name: dto.name,
        secretRef,
        config: dto.config || {},
        status: 'validating',
      },
    });

    const validation = await this.validateCredential(credential.id, dto.secret);
    
    await this.prisma.credential.update({
      where: { id: credential.id },
      data: {
        status: validation.success ? 'connected' : 'error',
        validationError: validation.success ? null : validation.message,
        lastValidatedAt: new Date(),
      },
    });

    await this.auditLog(orgId, userId, 'credential.create', 'Credential', credential.id, null, {
      type: dto.type,
      name: dto.name,
      status: validation.success ? 'connected' : 'error',
    });

    return this.sanitizeCredential(await this.prisma.credential.findUnique({ where: { id: credential.id } }));
  }

  async findAll(orgId: string) {
    const credentials = await this.prisma.credential.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
    return credentials.map(this.sanitizeCredential);
  }

  async findOne(orgId: string, id: string) {
    const credential = await this.prisma.credential.findUnique({
      where: { id },
    });

    if (!credential || credential.orgId !== orgId) {
      throw new NotFoundException('Credential not found');
    }

    return this.sanitizeCredential(credential);
  }

  async update(orgId: string, userId: string, id: string, dto: UpdateCredentialDto) {
    const credential = await this.prisma.credential.findUnique({ where: { id } });
    
    if (!credential || credential.orgId !== orgId) {
      throw new NotFoundException('Credential not found');
    }

    const before = { ...credential };

    let secretRef = credential.secretRef;
    if (dto.secret) {
      await this.secretsService.revoke(credential.secretRef);
      secretRef = await this.secretsService.store(orgId, JSON.stringify(dto.secret));
    }

    const updated = await this.prisma.credential.update({
      where: { id },
      data: {
        name: dto.name ?? credential.name,
        secretRef,
        config: dto.config ?? credential.config,
        status: dto.secret ? 'validating' : credential.status,
        validationError: dto.secret ? null : credential.validationError,
        lastValidatedAt: dto.secret ? new Date() : credential.lastValidatedAt,
      },
    });

    if (dto.secret) {
      const validation = await this.validateCredential(id, dto.secret);
      await this.prisma.credential.update({
        where: { id },
        data: {
          status: validation.success ? 'connected' : 'error',
          validationError: validation.success ? null : validation.message,
        },
      });
    }

    await this.auditLog(orgId, userId, 'credential.update', 'Credential', id, before, {
      name: updated.name,
      status: updated.status,
    });

    return this.sanitizeCredential(await this.prisma.credential.findUnique({ where: { id } }));
  }

  async delete(orgId: string, userId: string, id: string) {
    const credential = await this.prisma.credential.findUnique({ where: { id } });
    
    if (!credential || credential.orgId !== orgId) {
      throw new NotFoundException('Credential not found');
    }

    await this.secretsService.revoke(credential.secretRef);
    await this.prisma.credential.delete({ where: { id } });

    await this.auditLog(orgId, userId, 'credential.delete', 'Credential', id, credential, null);

    return { message: 'Credential deleted' };
  }

  async test(orgId: string, id: string, dto: TestCredentialDto) {
    const credential = await this.prisma.credential.findUnique({ where: { id } });
    
    if (!credential || credential.orgId !== orgId) {
      throw new NotFoundException('Credential not found');
    }

    const secret = await this.secretsService.retrieve(orgId, credential.secretRef);
    const secretData = JSON.parse(secret);

    const validator = this.validators.get(credential.type);
    if (!validator) {
      throw new BadRequestException(`No validator for credential type: ${credential.type}`);
    }

    return validator.validate(secretData, dto.params);
  }

  private async validateCredential(credentialId: string, secret: Record<string, any>) {
    const credential = await this.prisma.credential.findUnique({ where: { id: credentialId } });
    if (!credential) return { success: false, message: 'Credential not found' };

    const validator = this.validators.get(credential.type);
    if (!validator) return { success: false, message: `No validator for type: ${credential.type}` };

    return validator.validate(secret);
  }

  private sanitizeCredential(credential: any) {
    if (!credential) return null;
    const { secretRef, validationError, ...rest } = credential;
    return {
      ...rest,
      validationError: validationError || undefined,
      hasSecret: !!secretRef,
    };
  }

  private async auditLog(
    orgId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    before: any,
    after: any,
  ) {
    await this.prisma.auditLog.create({
      data: {
        orgId,
        actorId: userId,
        actorType: 'user',
        action,
        resourceType,
        resourceId,
        before,
        after,
      },
    });
  }
}
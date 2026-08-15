import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CredentialsService } from '../credentials/credentials.service';
import { SecretsService } from '../secrets/secrets.service';
import { CreateVoiceAgentConfigDto, UpdateVoiceAgentConfigDto, PhoneNumberSearchDto, PurchasePhoneNumberDto, TwilioWebhookDto } from './dto/voice.dto';

@Injectable()
export class VoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly credentialsService: CredentialsService,
    private readonly secretsService: SecretsService,
  ) {}

  // Voice Agent Config
  async createVoiceAgentConfig(orgId: string, userId: string, serviceId: string, dto: CreateVoiceAgentConfigDto) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.orgId !== orgId || service.type !== 'voice') {
      throw new NotFoundException('Voice service not found');
    }

    const existing = await this.prisma.voiceAgentConfig.findUnique({ where: { serviceId } });
    if (existing) {
      throw new ConflictException('Voice agent config already exists for this service');
    }

    const config = await this.prisma.voiceAgentConfig.create({
      data: {
        orgId,
        serviceId,
        personaName: dto.personaName,
        greetingScript: dto.greetingScript,
        voiceId: dto.voiceId,
        escalationNumber: dto.escalationNumber,
        businessHoursOverride: dto.businessHoursOverride,
        bargeInEnabled: dto.bargeInEnabled ?? false,
        maxCallDurationSeconds: dto.maxCallDurationSeconds ?? 300,
        recordingEnabled: dto.recordingEnabled ?? true,
        consentMessage: dto.consentMessage,
      },
    });

    await this.auditLog(orgId, userId, 'voice_agent_config.create', 'VoiceAgentConfig', config.id, null, config);
    return config;
  }

  async findVoiceAgentConfig(orgId: string, serviceId: string) {
    const config = await this.prisma.voiceAgentConfig.findUnique({ where: { serviceId } });
    if (!config || config.orgId !== orgId) {
      throw new NotFoundException('Voice agent config not found');
    }
    return config;
  }

  async updateVoiceAgentConfig(orgId: string, userId: string, serviceId: string, dto: UpdateVoiceAgentConfigDto) {
    const config = await this.prisma.voiceAgentConfig.findUnique({ where: { serviceId } });
    if (!config || config.orgId !== orgId) {
      throw new NotFoundException('Voice agent config not found');
    }

    const before = { ...config };
    const updated = await this.prisma.voiceAgentConfig.update({
      where: { serviceId },
      data: {
        personaName: dto.personaName ?? config.personaName,
        greetingScript: dto.greetingScript ?? config.greetingScript,
        voiceId: dto.voiceId ?? config.voiceId,
        escalationNumber: dto.escalationNumber ?? config.escalationNumber,
        businessHoursOverride: dto.businessHoursOverride ?? config.businessHoursOverride,
        bargeInEnabled: dto.bargeInEnabled ?? config.bargeInEnabled,
        maxCallDurationSeconds: dto.maxCallDurationSeconds ?? config.maxCallDurationSeconds,
        recordingEnabled: dto.recordingEnabled ?? config.recordingEnabled,
        consentMessage: dto.consentMessage ?? config.consentMessage,
      },
    });

    await this.auditLog(orgId, userId, 'voice_agent_config.update', 'VoiceAgentConfig', updated.id, before, updated);
    return updated;
  }

  async deleteVoiceAgentConfig(orgId: string, userId: string, serviceId: string) {
    const config = await this.prisma.voiceAgentConfig.findUnique({ where: { serviceId } });
    if (!config || config.orgId !== orgId) {
      throw new NotFoundException('Voice agent config not found');
    }

    await this.prisma.voiceAgentConfig.delete({ where: { serviceId } });
    await this.auditLog(orgId, userId, 'voice_agent_config.delete', 'VoiceAgentConfig', config.id, config, null);
    return { message: 'Voice agent config deleted' };
  }

  // Phone Numbers
  async searchPhoneNumbers(orgId: string, dto: PhoneNumberSearchDto) {
    const twilioCred = await this.getTwilioCredential(orgId);
    if (!twilioCred) {
      throw new BadRequestException('No Twilio credentials configured');
    }

    const secret = await this.secretsService.retrieve(orgId, twilioCred.secretRef);
    const { accountSid, authToken } = JSON.parse(secret);

    const twilio = require('twilio')(accountSid, authToken);
    const areaCode = dto.areaCode || '';
    const countryCode = dto.countryCode || 'US';

    try {
      const numbers = await twilio.availablePhoneNumbers(countryCode).local.list({
        areaCode: areaCode || undefined,
        limit: 20,
      });

      let results = numbers.map((n: any) => ({
        phoneNumber: n.phoneNumber,
        friendlyName: n.friendlyName,
        locality: n.locality,
        region: n.region,
        postalCode: n.postalCode,
        isoCountry: n.isoCountry,
        capabilities: n.capabilities,
      }));

      // If no results for area code, try nearby area codes
      if (results.length === 0 && areaCode) {
        const nearbyAreaCodes = this.getNearbyAreaCodes(areaCode);
        for (const nearby of nearbyAreaCodes) {
          const nearbyNumbers = await twilio.availablePhoneNumbers(countryCode).local.list({
            areaCode: nearby,
            limit: 10,
          });
          if (nearbyNumbers.length > 0) {
            results = nearbyNumbers.map((n: any) => ({
              phoneNumber: n.phoneNumber,
              friendlyName: n.friendlyName,
              locality: n.locality,
              region: n.region,
              postalCode: n.postalCode,
              isoCountry: n.isoCountry,
              capabilities: n.capabilities,
            }));
            return { numbers: results, searchedAreaCode: areaCode, usedAreaCode: nearby };
          }
        }
      }

      return { numbers: results, searchedAreaCode: areaCode, usedAreaCode: areaCode };
    } catch (error: any) {
      throw new BadRequestException(`Twilio search failed: ${error.message}`);
    }
  }

  async purchasePhoneNumber(orgId: string, userId: string, dto: PurchasePhoneNumberDto) {
    const twilioCred = await this.getTwilioCredential(orgId);
    if (!twilioCred) {
      throw new BadRequestException('No Twilio credentials configured');
    }

    const secret = await this.secretsService.retrieve(orgId, twilioCred.secretRef);
    const { accountSid, authToken } = JSON.parse(secret);

    const twilio = require('twilio')(accountSid, authToken);

    try {
      const purchased = await twilio.incomingPhoneNumbers.create({
        phoneNumber: dto.phoneNumber,
        friendlyName: dto.friendlyName,
        voiceUrl: `${this.configService.get('API_BASE_URL')}/api/voice/webhook/incoming`,
        statusCallback: `${this.configService.get('API_BASE_URL')}/api/voice/webhook/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
      });

      const phoneNumber = await this.prisma.phoneNumber.create({
        data: {
          orgId,
          serviceId: dto.serviceId,
          provider: 'twilio',
          providerSid: purchased.sid,
          phoneNumber: purchased.phoneNumber,
          friendlyName: dto.friendlyName,
          capabilities: purchased.capabilities,
          status: 'active',
          monthlyCostCents: Math.round(parseFloat(purchased.voiceCallerIdLookupPrice) * 100) || null,
        },
      });

      await this.auditLog(orgId, userId, 'phone_number.purchase', 'PhoneNumber', phoneNumber.id, null, phoneNumber);
      return phoneNumber;
    } catch (error: any) {
      throw new BadRequestException(`Twilio purchase failed: ${error.message}`);
    }
  }

  async findPhoneNumbers(orgId: string) {
    return this.prisma.phoneNumber.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async releasePhoneNumber(orgId: string, userId: string, id: string) {
    const phoneNumber = await this.prisma.phoneNumber.findUnique({ where: { id } });
    if (!phoneNumber || phoneNumber.orgId !== orgId) {
      throw new NotFoundException('Phone number not found');
    }

    const twilioCred = await this.getTwilioCredential(orgId);
    if (twilioCred) {
      const secret = await this.secretsService.retrieve(orgId, twilioCred.secretRef);
      const { accountSid, authToken } = JSON.parse(secret);
      const twilio = require('twilio')(accountSid, authToken);
      try {
        await twilio.incomingPhoneNumbers(phoneNumber.providerSid).remove();
      } catch (error) {
        console.error('Failed to release from Twilio:', error);
      }
    }

    const updated = await this.prisma.phoneNumber.update({
      where: { id },
      data: { status: 'released' },
    });

    await this.auditLog(orgId, userId, 'phone_number.release', 'PhoneNumber', id, phoneNumber, updated);
    return updated;
  }

  // Twilio Webhooks
  async handleIncomingCall(orgId: string, webhook: TwilioWebhookDto) {
    const phoneNumber = await this.prisma.phoneNumber.findFirst({
      where: { orgId, phoneNumber: webhook.To },
    });

    if (!phoneNumber || !phoneNumber.serviceId) {
      return this.generateTwimlResponse('We are unable to process your call at this time. Goodbye.', true);
    }

    const voiceConfig = await this.prisma.voiceAgentConfig.findUnique({
      where: { serviceId: phoneNumber.serviceId },
    });

    if (!voiceConfig) {
      return this.generateTwimlResponse('Service not configured. Goodbye.', true);
    }

    // Create conversation record
    const conversation = await this.prisma.conversation.create({
      data: {
        orgId,
        serviceId: phoneNumber.serviceId,
        channel: 'voice',
        customerIdentifier: webhook.From,
        status: 'active',
        metadata: { callSid: webhook.CallSid, phoneNumberId: phoneNumber.id },
      },
    });

    // Create call log
    const callLog = await this.prisma.callLog.create({
      data: {
        orgId,
        conversationId: conversation.id,
        phoneNumberId: phoneNumber.id,
        direction: 'inbound',
        fromNumber: webhook.From,
        toNumber: webhook.To,
        status: 'initiated',
        isSandbox: false,
      },
    });

    // Start the AI conversation with consent message
    const consentMessage = voiceConfig.consentMessage;
    const greetingScript = voiceConfig.greetingScript;

    return this.generateTwimlResponse(
      `${consentMessage} ${greetingScript}`,
      false,
      webhook.CallSid,
      conversation.id,
      callLog.id
    );
  }

  async handleCallStatus(orgId: string, webhook: TwilioWebhookDto) {
    const callLog = await this.prisma.callLog.findFirst({
      where: { orgId, metadata: { path: ['callSid'], equals: webhook.CallSid } },
    });

    if (!callLog) return { message: 'Call log not found' };

    const statusMap: Record<string, any> = {
      'initiated': 'initiated',
      'ringing': 'ringing',
      'in-progress': 'answered',
      'completed': 'completed',
      'busy': 'busy',
      'failed': 'failed',
      'no-answer': 'no_answer',
    };

    const duration = webhook.RecordingDuration ? parseInt(webhook.RecordingDuration) : null;

    await this.prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        status: statusMap[webhook.CallStatus] || webhook.CallStatus,
        durationSeconds: duration,
        recordingUrl: webhook.RecordingUrl,
      },
    });

    if (webhook.CallStatus === 'completed') {
      await this.prisma.conversation.update({
        where: { id: callLog.conversationId },
        data: { status: 'ended', endedAt: new Date() },
      });
    }

    return { message: 'Status updated' };
  }

  async handleRecording(orgId: string, webhook: TwilioWebhookDto) {
    const callLog = await this.prisma.callLog.findFirst({
      where: { orgId, metadata: { path: ['callSid'], equals: webhook.CallSid } },
    });

    if (!callLog) return { message: 'Call log not found' };

    // Transcription would be handled by Deepgram in real implementation
    // For now, store the recording URL
    await this.prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        recordingUrl: webhook.RecordingUrl,
        transcript: webhook.TranscriptionText,
      },
    });

    return { message: 'Recording processed' };
  }

  // Go Live Check
  async goLiveCheck(orgId: string, serviceId: string) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.orgId !== orgId || service.type !== 'voice') {
      throw new NotFoundException('Voice service not found');
    }

    const voiceConfig = await this.prisma.voiceAgentConfig.findUnique({ where: { serviceId } });
    if (!voiceConfig) {
      return { canGoLive: false, checks: { previewOpened: false, credentialsConnected: false } };
    }

    // Check if preview has been opened (has sandbox calls)
    const hasPreview = await this.prisma.callLog.findFirst({
      where: { orgId, serviceId, isSandbox: true },
    });

    // Check required credentials
    const requiredCreds = ['twilio', 'openai', 'deepgram', 'elevenlabs'];
    const creds = await this.prisma.credential.findMany({
      where: { orgId, type: { in: requiredCreds } },
    });
    const allConnected = requiredCreds.every(type => 
      creds.some(c => c.type === type && c.status === 'connected')
    );

    return {
      canGoLive: hasPreview && allConnected,
      checks: {
        previewOpened: !!hasPreview,
        credentialsConnected: allConnected,
      },
    };
  }

  // Sandbox/Preview call
  async initiateSandboxCall(orgId: string, userId: string, serviceId: string, phoneNumber: string) {
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.orgId !== orgId || service.type !== 'voice') {
      throw new NotFoundException('Voice service not found');
    }

    const twilioCred = await this.getTwilioCredential(orgId);
    if (!twilioCred) {
      throw new BadRequestException('No Twilio credentials configured');
    }

    const secret = await this.secretsService.retrieve(orgId, twilioCred.secretRef);
    const { accountSid, authToken } = JSON.parse(secret);
    const twilio = require('twilio')(accountSid, authToken);

    // Use the first available phone number for outbound
    const fromNumber = await this.prisma.phoneNumber.findFirst({
      where: { orgId, status: 'active' },
    });

    if (!fromNumber) {
      throw new BadRequestException('No active phone number available for outbound calls');
    }

    const call = await twilio.calls.create({
      to: phoneNumber,
      from: fromNumber.phoneNumber,
      url: `${this.configService.get('API_BASE_URL')}/api/voice/webhook/incoming?sandbox=true`,
      statusCallback: `${this.configService.get('API_BASE_URL')}/api/voice/webhook/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
    });

    const conversation = await this.prisma.conversation.create({
      data: {
        orgId,
        serviceId,
        channel: 'voice',
        customerIdentifier: phoneNumber,
        status: 'active',
        isSandbox: true,
        metadata: { callSid: call.sid, initiatedBy: userId },
      },
    });

    const callLog = await this.prisma.callLog.create({
      data: {
        orgId,
        conversationId: conversation.id,
        phoneNumberId: fromNumber.id,
        direction: 'outbound',
        fromNumber: fromNumber.phoneNumber,
        toNumber: phoneNumber,
        status: 'initiated',
        isSandbox: true,
      },
    });

    return { callSid: call.sid, conversationId: conversation.id, callLogId: callLog.id };
  }

  private async getTwilioCredential(orgId: string) {
    const creds = await this.prisma.credential.findMany({
      where: { orgId, type: 'twilio', status: 'connected' },
    });
    return creds[0] || null;
  }

  private getNearbyAreaCodes(areaCode: string): string[] {
    const code = parseInt(areaCode);
    const nearby = [];
    for (let i = -5; i <= 5; i++) {
      if (i !== 0) {
        const nearbyCode = code + i;
        if (nearbyCode >= 200 && nearbyCode <= 999) {
          nearby.push(nearbyCode.toString());
        }
      }
    }
    return nearby;
  }

  private generateTwimlResponse(message: string, hangup: boolean, callSid?: string, conversationId?: string, callLogId?: string): string {
    let twiml = `<?xml version="1.0" encoding="UTF-8"?><Response>`;
    
    if (message) {
      twiml += `<Say voice="Polly.Joanna">${this.escapeXml(message)}</Say>`;
    }
    
    if (hangup) {
      twiml += `<Hangup/>`;
    } else {
      // Gather speech input for the AI orchestrator
      twiml += `<Gather input="speech" action="/api/voice/webhook/process-speech" method="POST" speechTimeout="auto" enhanced="true" language="en-US">`;
      twiml += `<Say voice="Polly.Joanna">I'm listening.</Say>`;
      twiml += `</Gather>`;
      // Fallback if no speech detected
      twiml += `<Redirect>/api/voice/webhook/process-speech</Redirect>`;
    }
    
    twiml += `</Response>`;
    return twiml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&apos;');
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
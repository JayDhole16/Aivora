import { Injectable } from '@nestjs/common';
import { CredentialType } from '@aivora/shared-types';

export interface CredentialValidator {
  validate(secret: Record<string, any>, params?: Record<string, any>): Promise<{ success: boolean; message: string; details?: any }>;
}

@Injectable()
export class TwilioCredentialValidator implements CredentialValidator {
  async validate(secret: Record<string, any>, params?: Record<string, any>): Promise<{ success: boolean; message: string; details?: any }> {
    const { accountSid, authToken } = secret;
    
    if (!accountSid || !authToken) {
      return { success: false, message: 'Missing accountSid or authToken' };
    }

    if (!accountSid.startsWith('AC')) {
      return { success: false, message: 'Invalid accountSid format' };
    }

    try {
      const twilio = require('twilio')(accountSid, authToken);
      const account = await twilio.api.accounts(accountSid).fetch();
      return { 
        success: true, 
        message: 'Twilio credentials validated successfully',
        details: { accountStatus: account.status, accountType: account.type }
      };
    } catch (error: any) {
      return { success: false, message: `Twilio validation failed: ${error.message}` };
    }
  }
}

@Injectable()
export class OpenAICredentialValidator implements CredentialValidator {
  async validate(secret: Record<string, any>, params?: Record<string, any>): Promise<{ success: boolean; message: string; details?: any }> {
    const { apiKey } = secret;
    
    if (!apiKey) {
      return { success: false, message: 'Missing apiKey' };
    }

    if (!apiKey.startsWith('sk-')) {
      return { success: false, message: 'Invalid OpenAI API key format' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      
      if (!response.ok) {
        return { success: false, message: `OpenAI validation failed: ${response.statusText}` };
      }
      
      return { success: true, message: 'OpenAI credentials validated successfully' };
    } catch (error: any) {
      return { success: false, message: `OpenAI validation failed: ${error.message}` };
    }
  }
}

@Injectable()
export class DeepgramCredentialValidator implements CredentialValidator {
  async validate(secret: Record<string, any>, params?: Record<string, any>): Promise<{ success: boolean; message: string; details?: any }> {
    const { apiKey } = secret;
    
    if (!apiKey) {
      return { success: false, message: 'Missing apiKey' };
    }

    try {
      const response = await fetch('https://api.deepgram.com/v1/projects', {
        headers: { Authorization: `Token ${apiKey}` },
      });
      
      if (!response.ok) {
        return { success: false, message: `Deepgram validation failed: ${response.statusText}` };
      }
      
      return { success: true, message: 'Deepgram credentials validated successfully' };
    } catch (error: any) {
      return { success: false, message: `Deepgram validation failed: ${error.message}` };
    }
  }
}

@Injectable()
export class ElevenLabsCredentialValidator implements CredentialValidator {
  async validate(secret: Record<string, any>, params?: Record<string, any>): Promise<{ success: boolean; message: string; details?: any }> {
    const { apiKey } = secret;
    
    if (!apiKey) {
      return { success: false, message: 'Missing apiKey' };
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': apiKey },
      });
      
      if (!response.ok) {
        return { success: false, message: `ElevenLabs validation failed: ${response.statusText}` };
      }
      
      return { success: true, message: 'ElevenLabs credentials validated successfully' };
    } catch (error: any) {
      return { success: false, message: `ElevenLabs validation failed: ${error.message}` };
    }
  }
}

@Injectable()
export class GoogleCalendarCredentialValidator implements CredentialValidator {
  async validate(secret: Record<string, any>, params?: Record<string, any>): Promise<{ success: boolean; message: string; details?: any }> {
    const { accessToken, refreshToken } = secret;
    
    if (!accessToken) {
      return { success: false, message: 'Missing accessToken' };
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) {
        if (response.status === 401 && refreshToken) {
          return { success: false, message: 'Access token expired, refresh token available' };
        }
        return { success: false, message: `Google Calendar validation failed: ${response.statusText}` };
      }
      
      return { success: true, message: 'Google Calendar credentials validated successfully' };
    } catch (error: any) {
      return { success: false, message: `Google Calendar validation failed: ${error.message}` };
    }
  }
}

@Injectable()
export class NotImplementedCredentialValidator implements CredentialValidator {
  constructor(private readonly type: CredentialType) {}

  async validate(): Promise<{ success: boolean; message: string }> {
    return { 
      success: false, 
      message: `Validation not implemented for ${this.type} - will be implemented in later stage` 
    };
  }
}

export const CREDENTIAL_VALIDATORS: Record<CredentialType, string> = {
  twilio: 'TwilioCredentialValidator',
  meta_whatsapp: 'NotImplementedCredentialValidator',
  openai: 'OpenAICredentialValidator',
  anthropic: 'NotImplementedCredentialValidator',
  deepgram: 'DeepgramCredentialValidator',
  elevenlabs: 'ElevenLabsCredentialValidator',
  azure_tts: 'NotImplementedCredentialValidator',
  google_calendar: 'GoogleCalendarCredentialValidator',
  outlook_calendar: 'NotImplementedCredentialValidator',
  s3_storage: 'NotImplementedCredentialValidator',
  other: 'NotImplementedCredentialValidator',
};
import { type Credential } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

export const MOCK_CREDENTIALS: Credential[] = [
  {
    id: 'cred-1',
    serviceId: 'svc-voice-1',
    provider: 'Twilio',
    purpose: 'Voice calls & phone number',
    status: 'connected',
    lastValidatedAt: '2026-08-10T08:00:00Z',
    metadata: { accountSid: 'AC***...***', phoneNumber: '+1-415-555-0147' },
  },
  {
    id: 'cred-2',
    serviceId: 'svc-wa-1',
    provider: 'Meta WhatsApp',
    purpose: 'WhatsApp messaging',
    status: 'connected',
    lastValidatedAt: '2026-08-12T14:00:00Z',
    metadata: { wabaId: 'WABA***', phoneNumberId: 'PHONE***' },
  },
  {
    id: 'cred-3',
    provider: 'Google Calendar',
    purpose: 'Appointment booking',
    status: 'connected',
    lastValidatedAt: '2026-08-14T09:00:00Z',
    metadata: { email: 'priya@glowsalon.com' },
  },
  {
    id: 'cred-4',
    provider: 'Stripe',
    purpose: 'Payment processing',
    status: 'not_connected',
  },
  {
    id: 'cred-5',
    provider: 'Meta Business',
    purpose: 'Business verification',
    status: 'pending_verification',
    metadata: { businessName: 'Glow Salon & Spa' },
  },
];

export async function getCredentials(orgId: string): Promise<Credential[]> {
  if (USE_MOCKS) return mockResponse(MOCK_CREDENTIALS);
  return apiRequest<Credential[]>(`/orgs/${orgId}/credentials`);
}

export async function testCredential(credentialId: string): Promise<{ success: boolean; message: string }> {
  if (USE_MOCKS) {
    const cred = MOCK_CREDENTIALS.find((c) => c.id === credentialId);
    const success = cred?.status === 'connected';
    return mockResponse({ success, message: success ? 'Connection verified successfully.' : 'Connection failed. Please check your settings.' }, 1500);
  }
  return apiRequest<{ success: boolean; message: string }>(`/credentials/${credentialId}/test`, { method: 'POST' });
}

export async function disconnectCredential(credentialId: string): Promise<void> {
  if (USE_MOCKS) return mockResponse(undefined, 500);
  return apiRequest<void>(`/credentials/${credentialId}`, { method: 'DELETE' });
}

export async function connectFacebook(): Promise<{ authUrl: string }> {
  if (USE_MOCKS) return mockResponse({ authUrl: '#mock-facebook-oauth' }, 300);
  return apiRequest<{ authUrl: string }>('/credentials/whatsapp/facebook-oauth');
}

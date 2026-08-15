import { type Service, type VoiceConfig, type WhatsAppConfig, type WebsiteConfig } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

export const MOCK_SERVICES: Service[] = [
  {
    id: 'svc-voice-1',
    orgId: 'org-1',
    type: 'voice',
    name: 'Voice Receptionist',
    status: 'live',
    deployedAt: '2026-07-15T10:00:00Z',
    callsThisWeek: 47,
  },
  {
    id: 'svc-wa-1',
    orgId: 'org-1',
    type: 'whatsapp',
    name: 'WhatsApp Assistant',
    status: 'testing',
    messagesThisWeek: 124,
  },
  {
    id: 'svc-web-1',
    orgId: 'org-1',
    type: 'website',
    name: 'Business Website',
    status: 'draft',
    visitsThisWeek: 0,
  },
];

export const MOCK_VOICE_CONFIG: VoiceConfig = {
  serviceId: 'svc-voice-1',
  greetingScript:
    "Hi there! You've reached Glow Salon & Spa. I'm your AI assistant. I can help you book an appointment, check our services and prices, or answer any questions. How can I help you today?",
  tone: 'friendly',
  afterHoursBehavior: 'voicemail',
  escalationNumber: '+91-98765-43210',
  phoneNumber: '+1-415-555-0147',
  areaCode: '415',
  calendarConnected: true,
  calendarProvider: 'google',
  businessHours: {
    monday: { open: '09:00', close: '19:00' },
    tuesday: { open: '09:00', close: '19:00' },
    wednesday: { open: '09:00', close: '19:00' },
    thursday: { open: '09:00', close: '19:00' },
    friday: { open: '09:00', close: '20:00' },
    saturday: { open: '10:00', close: '18:00' },
    sunday: { open: '10:00', close: '16:00' },
  },
};

export const MOCK_WA_CONFIG: WhatsAppConfig = {
  serviceId: 'svc-wa-1',
  connected: true,
  connectionMethod: 'facebook_oauth',
  greeting: "Hi! 👋 Welcome to Glow Salon. I'm your WhatsApp assistant. How can I help?",
  tone: 'friendly',
  handoffKeywords: ['human', 'agent', 'real person', 'manager'],
  businessHours: {
    monday: { open: '09:00', close: '19:00', closed: false },
    tuesday: { open: '09:00', close: '19:00', closed: false },
    wednesday: { open: '09:00', close: '19:00', closed: false },
    thursday: { open: '09:00', close: '19:00', closed: false },
    friday: { open: '09:00', close: '20:00', closed: false },
    saturday: { open: '10:00', close: '18:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: false },
  },
  templates: [
    {
      id: 'tpl-1',
      name: 'appointment_reminder',
      body: 'Hi {{1}}, this is a reminder for your appointment at Glow Salon on {{2}} at {{3}}. Reply CONFIRM to confirm or CANCEL to cancel.',
      status: 'approved',
      category: 'UTILITY',
      submittedAt: '2026-07-10T09:00:00Z',
    },
    {
      id: 'tpl-2',
      name: 'booking_confirmation',
      body: 'Your appointment has been confirmed! 🎉 {{1}} at {{2}}. See you soon at Glow Salon.',
      status: 'approved',
      category: 'UTILITY',
      submittedAt: '2026-07-10T09:00:00Z',
    },
    {
      id: 'tpl-3',
      name: 'promo_offer',
      body: '✨ Special offer! Get 20% off on all hair treatments this weekend. Book now: {{1}}',
      status: 'rejected',
      rejectionReason: 'Marketing templates require pre-approved opt-in. Please ensure customers have opted in before sending.',
      category: 'MARKETING',
      submittedAt: '2026-07-20T09:00:00Z',
    },
    {
      id: 'tpl-4',
      name: 'cancellation_followup',
      body: 'We noticed you cancelled your appointment at Glow Salon. We\'d love to reschedule — pick a new time: {{1}}',
      status: 'pending',
      category: 'UTILITY',
      submittedAt: '2026-08-10T09:00:00Z',
    },
  ],
};

export const MOCK_WEB_CONFIG: WebsiteConfig = {
  serviceId: 'svc-web-1',
  template: 'salon',
  sections: [
    { id: 's1', type: 'hero', title: 'Where Beauty Meets Relaxation', content: 'Book your perfect experience today.', enabled: true, order: 1 },
    { id: 's2', type: 'services', title: 'Our Services', enabled: true, order: 2 },
    { id: 's3', type: 'about', title: 'About Us', content: 'Glow Salon has been serving Bengaluru since 2018.', enabled: true, order: 3 },
    { id: 's4', type: 'booking', title: 'Book an Appointment', enabled: true, order: 4 },
    { id: 's5', type: 'testimonials', title: 'What our clients say', enabled: true, order: 5 },
    { id: 's6', type: 'contact', title: 'Find us', enabled: true, order: 6 },
  ],
  primaryColor: '#6366f1',
  bookingWidgetEnabled: true,
  chatWidgetEnabled: true,
  subdomain: 'glow-salon',
  stagingUrl: 'https://preview--glow-salon.aivora.site',
};

// ─── API functions ────────────────────────────────────────────────────────────

export async function getServices(orgId: string): Promise<Service[]> {
  if (USE_MOCKS) return mockResponse(MOCK_SERVICES);
  return apiRequest<Service[]>(`/orgs/${orgId}/services`);
}

export async function getService(serviceId: string): Promise<Service> {
  if (USE_MOCKS) {
    const svc = MOCK_SERVICES.find((s) => s.id === serviceId);
    if (!svc) throw new Error('Service not found');
    return mockResponse(svc);
  }
  return apiRequest<Service>(`/services/${serviceId}`);
}

export async function createService(orgId: string, data: Partial<Service>): Promise<Service> {
  if (USE_MOCKS) {
    const newSvc: Service = {
      id: `svc-${Date.now()}`,
      orgId,
      type: data.type ?? 'voice',
      name: data.name ?? 'New Service',
      status: 'draft',
    };
    return mockResponse(newSvc, 800);
  }
  return apiRequest<Service>(`/orgs/${orgId}/services`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateServiceStatus(serviceId: string, status: Service['status']): Promise<Service> {
  if (USE_MOCKS) {
    const svc = MOCK_SERVICES.find((s) => s.id === serviceId)!;
    return mockResponse({ ...svc, status }, 500);
  }
  return apiRequest<Service>(`/services/${serviceId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getVoiceConfig(serviceId: string): Promise<VoiceConfig> {
  if (USE_MOCKS) return mockResponse(MOCK_VOICE_CONFIG);
  return apiRequest<VoiceConfig>(`/services/${serviceId}/voice-config`);
}

export async function updateVoiceConfig(serviceId: string, data: Partial<VoiceConfig>): Promise<VoiceConfig> {
  if (USE_MOCKS) return mockResponse({ ...MOCK_VOICE_CONFIG, ...data }, 600);
  return apiRequest<VoiceConfig>(`/services/${serviceId}/voice-config`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function searchPhoneNumbers(areaCode: string): Promise<string[]> {
  if (USE_MOCKS) {
    return mockResponse([
      `+1-${areaCode}-555-0101`,
      `+1-${areaCode}-555-0147`,
      `+1-${areaCode}-555-0183`,
      `+1-${areaCode}-555-0209`,
    ], 1200);
  }
  return apiRequest<string[]>(`/phone-numbers/search?areaCode=${areaCode}`);
}

export async function provisionPhoneNumber(number: string): Promise<{ provisioned: boolean; number: string }> {
  if (USE_MOCKS) return mockResponse({ provisioned: true, number }, 1500);
  return apiRequest<{ provisioned: boolean; number: string }>('/phone-numbers/provision', {
    method: 'POST',
    body: JSON.stringify({ number }),
  });
}

export async function getWhatsAppConfig(serviceId: string): Promise<WhatsAppConfig> {
  if (USE_MOCKS) return mockResponse(MOCK_WA_CONFIG);
  return apiRequest<WhatsAppConfig>(`/services/${serviceId}/whatsapp-config`);
}

export async function updateWhatsAppConfig(serviceId: string, data: Partial<WhatsAppConfig>): Promise<WhatsAppConfig> {
  if (USE_MOCKS) return mockResponse({ ...MOCK_WA_CONFIG, ...data }, 600);
  return apiRequest<WhatsAppConfig>(`/services/${serviceId}/whatsapp-config`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function submitWhatsAppTemplate(serviceId: string, template: Omit<import('@/types').WhatsAppTemplate, 'id' | 'status' | 'submittedAt'>): Promise<import('@/types').WhatsAppTemplate> {
  if (USE_MOCKS) {
    const newTemplate: import('@/types').WhatsAppTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    return mockResponse(newTemplate, 800);
  }
  return apiRequest<import('@/types').WhatsAppTemplate>(`/services/${serviceId}/whatsapp-templates`, {
    method: 'POST',
    body: JSON.stringify(template),
  });
}

export async function getWebsiteConfig(serviceId: string): Promise<WebsiteConfig> {
  if (USE_MOCKS) return mockResponse(MOCK_WEB_CONFIG);
  return apiRequest<WebsiteConfig>(`/services/${serviceId}/website-config`);
}

export async function updateWebsiteConfig(serviceId: string, data: Partial<WebsiteConfig>): Promise<WebsiteConfig> {
  if (USE_MOCKS) return mockResponse({ ...MOCK_WEB_CONFIG, ...data }, 600);
  return apiRequest<WebsiteConfig>(`/services/${serviceId}/website-config`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function verifyDomain(serviceId: string, domain: string): Promise<{ verified: boolean }> {
  if (USE_MOCKS) return mockResponse({ verified: Math.random() > 0.4 }, 2000);
  return apiRequest<{ verified: boolean }>(`/services/${serviceId}/verify-domain`, {
    method: 'POST',
    body: JSON.stringify({ domain }),
  });
}

export async function publishWebsite(serviceId: string): Promise<{ publishedAt: string }> {
  if (USE_MOCKS) return mockResponse({ publishedAt: new Date().toISOString() }, 2000);
  return apiRequest<{ publishedAt: string }>(`/services/${serviceId}/publish`, { method: 'POST' });
}

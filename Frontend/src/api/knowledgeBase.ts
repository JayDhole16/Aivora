import { type KnowledgeBaseEntry } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

export const MOCK_KB_ENTRIES: KnowledgeBaseEntry[] = [
  {
    id: 'kb-1',
    type: 'hours',
    title: 'Business Hours',
    content: 'Monday–Friday: 9am–7pm\nSaturday: 10am–6pm\nSunday: 10am–4pm',
    source: 'manual',
  },
  {
    id: 'kb-2',
    type: 'service',
    title: 'Haircut & Styling',
    content: 'Women\'s cut from ₹800\nMen\'s cut from ₹400\nBlow-dry from ₹600\nHair coloring from ₹2,500',
    source: 'manual',
  },
  {
    id: 'kb-3',
    type: 'service',
    title: 'Skin Treatments',
    content: 'Classic facial: ₹1,500 (60 min)\nAnti-aging facial: ₹2,500 (75 min)\nCleanup: ₹800 (30 min)',
    source: 'document_upload',
  },
  {
    id: 'kb-4',
    type: 'service',
    title: 'Nail Services',
    content: 'Manicure: ₹600\nPedicure: ₹800\nGel nails: ₹1,200\nNail art: from ₹200 per nail',
    source: 'auto_parsed',
  },
  {
    id: 'kb-5',
    type: 'faq',
    title: 'How do I book an appointment?',
    content: 'You can book through WhatsApp, call us at +91-80-4567-8901, or visit our website. Walk-ins welcome based on availability.',
    source: 'manual',
  },
  {
    id: 'kb-6',
    type: 'faq',
    title: 'What is your cancellation policy?',
    content: 'Please cancel at least 2 hours before your appointment. Late cancellations or no-shows may incur a 25% fee.',
    source: 'manual',
  },
  {
    id: 'kb-7',
    type: 'policy',
    title: 'Payment methods',
    content: 'We accept cash, all major credit/debit cards, UPI (GPay, PhonePe, Paytm), and net banking.',
    source: 'manual',
  },
];

export async function getKnowledgeBase(orgId: string): Promise<KnowledgeBaseEntry[]> {
  if (USE_MOCKS) return mockResponse(MOCK_KB_ENTRIES);
  return apiRequest<KnowledgeBaseEntry[]>(`/orgs/${orgId}/knowledge-base`);
}

export async function createKBEntry(orgId: string, entry: Omit<KnowledgeBaseEntry, 'id'>): Promise<KnowledgeBaseEntry> {
  if (USE_MOCKS) {
    return mockResponse({ ...entry, id: `kb-${Date.now()}` }, 500);
  }
  return apiRequest<KnowledgeBaseEntry>(`/orgs/${orgId}/knowledge-base`, {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export async function updateKBEntry(orgId: string, entryId: string, data: Partial<KnowledgeBaseEntry>): Promise<KnowledgeBaseEntry> {
  if (USE_MOCKS) {
    const entry = MOCK_KB_ENTRIES.find((e) => e.id === entryId)!;
    return mockResponse({ ...entry, ...data }, 500);
  }
  return apiRequest<KnowledgeBaseEntry>(`/orgs/${orgId}/knowledge-base/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteKBEntry(orgId: string, entryId: string): Promise<void> {
  if (USE_MOCKS) return mockResponse(undefined, 300);
  return apiRequest<void>(`/orgs/${orgId}/knowledge-base/${entryId}`, { method: 'DELETE' });
}

export async function uploadKBDocument(orgId: string, _file: File): Promise<KnowledgeBaseEntry[]> {
  if (USE_MOCKS) {
    // Simulate auto-parsing
    const parsed: KnowledgeBaseEntry[] = [
      { id: `kb-p1-${Date.now()}`, type: 'service', title: 'Premium Hair Spa', content: '₹3,500 — Deep conditioning + scalp massage (90 min)', source: 'auto_parsed' },
      { id: `kb-p2-${Date.now()}`, type: 'service', title: 'Bridal Package', content: 'Full bridal makeup, hair, and nail package from ₹15,000', source: 'auto_parsed' },
      { id: `kb-p3-${Date.now()}`, type: 'pricing', title: 'Weekend surcharge', content: '10% surcharge applies on weekends for all treatments.', source: 'auto_parsed' },
    ];
    return mockResponse(parsed, 2500);
  }
  const form = new FormData();
  form.append('file', _file);
  return apiRequest<KnowledgeBaseEntry[]>(`/orgs/${orgId}/knowledge-base/upload`, {
    method: 'POST',
    headers: {}, // Let browser set multipart boundary
    body: form,
  });
}

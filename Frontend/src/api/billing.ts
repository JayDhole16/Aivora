import { type Plan, type Usage, type Invoice } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

export const AVAILABLE_PLANS: Plan[] = [
  {
    tier: 'starter',
    name: 'Starter',
    priceMonthly: 2900,
    voiceMinutesIncluded: 100,
    whatsappConversationsIncluded: 250,
    phoneNumbersIncluded: 1,
    features: ['1 phone number', '250 WhatsApp conversations/mo', '100 voice minutes/mo', 'Basic analytics', 'Email support'],
  },
  {
    tier: 'growth',
    name: 'Growth',
    priceMonthly: 7900,
    voiceMinutesIncluded: 500,
    whatsappConversationsIncluded: 1000,
    phoneNumbersIncluded: 2,
    features: ['2 phone numbers', '1,000 WhatsApp conversations/mo', '500 voice minutes/mo', 'Advanced analytics', 'Priority support', 'Custom domain'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    priceMonthly: 19900,
    voiceMinutesIncluded: 2000,
    whatsappConversationsIncluded: 5000,
    phoneNumbersIncluded: 5,
    features: ['5 phone numbers', '5,000 WhatsApp conversations/mo', '2,000 voice minutes/mo', 'Full analytics', 'Dedicated support', 'Custom domain', 'Team & Roles', 'API access'],
  },
];

const MOCK_USAGE: Usage = {
  voiceMinutesUsed: 73,
  voiceMinutesIncluded: 100,
  whatsappConversationsUsed: 124,
  whatsappConversationsIncluded: 250,
  phoneNumbersUsed: 1,
  phoneNumbersIncluded: 1,
};

const MOCK_INVOICES: Invoice[] = [
  { id: 'inv-1', amount: 2900, currency: 'USD', status: 'paid', periodStart: '2026-07-01', periodEnd: '2026-07-31', pdfUrl: '#' },
  { id: 'inv-2', amount: 2900, currency: 'USD', status: 'paid', periodStart: '2026-06-01', periodEnd: '2026-06-30', pdfUrl: '#' },
  { id: 'inv-3', amount: 2900, currency: 'USD', status: 'paid', periodStart: '2026-05-01', periodEnd: '2026-05-31', pdfUrl: '#' },
];

export async function getCurrentPlan(orgId: string): Promise<Plan> {
  if (USE_MOCKS) return mockResponse(AVAILABLE_PLANS[0]);
  return apiRequest<Plan>(`/orgs/${orgId}/billing/plan`);
}

export async function getUsage(orgId: string): Promise<Usage> {
  if (USE_MOCKS) return mockResponse(MOCK_USAGE);
  return apiRequest<Usage>(`/orgs/${orgId}/billing/usage`);
}

export async function getInvoices(orgId: string): Promise<Invoice[]> {
  if (USE_MOCKS) return mockResponse(MOCK_INVOICES);
  return apiRequest<Invoice[]>(`/orgs/${orgId}/billing/invoices`);
}

export async function upgradePlan(orgId: string, tier: Plan['tier']): Promise<{ checkoutUrl: string }> {
  if (USE_MOCKS) return mockResponse({ checkoutUrl: '#mock-stripe-checkout' }, 500);
  return apiRequest<{ checkoutUrl: string }>(`/orgs/${orgId}/billing/upgrade`, {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
}

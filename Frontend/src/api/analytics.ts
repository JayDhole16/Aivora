import { type AnalyticsKPI, type AnalyticsTrend, type ChannelBreakdown } from '@/types';
import { USE_MOCKS, mockResponse, apiRequest } from './client';

const MOCK_KPI: AnalyticsKPI = {
  callsTotal: 47,
  callsDelta: 12.5,
  messagesTotal: 124,
  messagesDelta: -3.2,
  bookingsTotal: 38,
  bookingsDelta: 8.7,
  aiResolutionRate: 0.84,
  aiResolutionDelta: 2.1,
};

const generateTrend = (): AnalyticsTrend[] => {
  const trends: AnalyticsTrend[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    trends.push({
      date: d.toISOString().split('T')[0],
      calls: Math.floor(Math.random() * 15) + 2,
      messages: Math.floor(Math.random() * 30) + 5,
      bookings: Math.floor(Math.random() * 10) + 1,
    });
  }
  return trends;
};

const MOCK_TREND = generateTrend();

const MOCK_BREAKDOWN: ChannelBreakdown[] = [
  { channel: 'voice', total: 47, resolved: 39, escalated: 8, avgDurationSeconds: 145 },
  { channel: 'whatsapp', total: 124, resolved: 108, escalated: 16 },
  { channel: 'website_chat', total: 23, resolved: 19, escalated: 4 },
];

export async function getAnalyticsKPI(orgId: string): Promise<AnalyticsKPI> {
  if (USE_MOCKS) return mockResponse(MOCK_KPI);
  return apiRequest<AnalyticsKPI>(`/orgs/${orgId}/analytics/kpi`);
}

export async function getAnalyticsTrend(orgId: string): Promise<AnalyticsTrend[]> {
  if (USE_MOCKS) return mockResponse(MOCK_TREND);
  return apiRequest<AnalyticsTrend[]>(`/orgs/${orgId}/analytics/trend`);
}

export async function getChannelBreakdown(orgId: string): Promise<ChannelBreakdown[]> {
  if (USE_MOCKS) return mockResponse(MOCK_BREAKDOWN);
  return apiRequest<ChannelBreakdown[]>(`/orgs/${orgId}/analytics/channels`);
}

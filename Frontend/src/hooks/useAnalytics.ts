import { useQuery } from '@tanstack/react-query';
import { getAnalyticsKPI, getAnalyticsTrend, getChannelBreakdown } from '@/api/analytics';
import { useAuth } from './useAuth';

export function useAnalyticsKPI() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'kpi', user?.orgId],
    queryFn: () => getAnalyticsKPI(user!.orgId),
    enabled: !!user,
  });
}

export function useAnalyticsTrend() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'trend', user?.orgId],
    queryFn: () => getAnalyticsTrend(user!.orgId),
    enabled: !!user,
  });
}

export function useChannelBreakdown() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'channels', user?.orgId],
    queryFn: () => getChannelBreakdown(user!.orgId),
    enabled: !!user,
  });
}

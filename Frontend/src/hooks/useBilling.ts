import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentPlan, getUsage, getInvoices, upgradePlan } from '@/api/billing';
import { useAuth } from './useAuth';

export function useBilling() {
  const { data: user } = useAuth();
  const plan = useQuery({ queryKey: ['billing', 'plan', user?.orgId], queryFn: () => getCurrentPlan(user!.orgId), enabled: !!user });
  const usage = useQuery({ queryKey: ['billing', 'usage', user?.orgId], queryFn: () => getUsage(user!.orgId), enabled: !!user });
  const invoices = useQuery({ queryKey: ['billing', 'invoices', user?.orgId], queryFn: () => getInvoices(user!.orgId), enabled: !!user });
  return { plan, usage, invoices };
}

export function useUpgradePlan() {
  const { data: user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tier: Parameters<typeof upgradePlan>[1]) => upgradePlan(user!.orgId, tier),
    onSuccess: ({ checkoutUrl }) => {
      if (checkoutUrl !== '#mock-stripe-checkout') {
        window.location.href = checkoutUrl;
      }
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
}

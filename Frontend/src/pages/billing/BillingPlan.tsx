import React from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import { useBilling, useUpgradePlan } from '@/hooks/useBilling';
import { AVAILABLE_PLANS } from '@/api/billing';
import { formatCurrency, cn } from '@/lib/utils';
import type { PlanTier } from '@/types';
import { toast } from 'sonner';

export function BillingPlan() {
  const { plan, usage, invoices } = useBilling();
  const upgradeMutation = useUpgradePlan();

  const handleUpgrade = (tier: PlanTier) => {
    upgradeMutation.mutate(tier);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-neutral-900">Billing & Usage</h1>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold">
            Active Subscription
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Monitor your voice minutes, WhatsApp conversations, and invoice history.
        </p>
      </div>

      {/* Usage Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Voice minutes */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-neutral-600">Voice AI Minutes</span>
            <span className="font-mono font-bold text-neutral-900">
              {usage.data?.voiceMinutesUsed} / {usage.data?.voiceMinutesIncluded} mins
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{
                width: `${((usage.data?.voiceMinutesUsed || 0) / (usage.data?.voiceMinutesIncluded || 100)) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-neutral-400">Resets on the 1st of every month</p>
        </div>

        {/* WhatsApp conversations */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-neutral-600">WhatsApp Conversations</span>
            <span className="font-mono font-bold text-neutral-900">
              {usage.data?.whatsappConversationsUsed} / {usage.data?.whatsappConversationsIncluded}
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{
                width: `${((usage.data?.whatsappConversationsUsed || 0) / (usage.data?.whatsappConversationsIncluded || 250)) * 100}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-neutral-400">Unlimited 24-hr customer service replies</p>
        </div>

        {/* Phone numbers */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-neutral-600">Active Phone Numbers</span>
            <span className="font-mono font-bold text-neutral-900">
              {usage.data?.phoneNumbersUsed} / {usage.data?.phoneNumbersIncluded}
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full bg-neutral-800 rounded-full w-full" />
          </div>
          <p className="text-[11px] text-neutral-400">1 dedicated local area code number included</p>
        </div>
      </div>

      {/* Available Plans Comparison */}
      <div>
        <h2 className="text-base font-bold text-neutral-900 mb-4">Choose Your Growth Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AVAILABLE_PLANS.map((tier) => {
            const isCurrent = plan.data?.tier === tier.tier;

            return (
              <div
                key={tier.tier}
                className={cn(
                  'bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all duration-200',
                  isCurrent
                    ? 'border-indigo-600 ring-2 ring-indigo-600 shadow-md'
                    : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">{tier.name}</h3>
                    {isCurrent && (
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full">
                        Current plan
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl font-extrabold text-neutral-900 font-mono">
                      {formatCurrency(tier.priceMonthly)}
                    </span>
                    <span className="text-xs text-neutral-400">/month</span>
                  </div>

                  <ul className="space-y-2.5 my-6 text-xs text-neutral-600">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={15} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 bg-neutral-100 text-neutral-500 rounded-xl text-xs font-semibold"
                  >
                    Your active plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade(tier.tier)}
                    disabled={upgradeMutation.isPending}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all"
                  >
                    Upgrade to {tier.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900">Invoice History</h3>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Billing cycle</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs">
            {invoices.data?.map((inv) => (
              <tr key={inv.id} className="hover:bg-neutral-50/60 transition-colors">
                <td className="py-4 px-6 text-neutral-800 font-medium">
                  {inv.periodStart} – {inv.periodEnd}
                </td>
                <td className="py-4 px-6 font-mono font-bold text-neutral-900">
                  {formatCurrency(inv.amount, inv.currency)}
                </td>
                <td className="py-4 px-6">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                    Paid
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    type="button"
                    onClick={() => toast.success('Downloading invoice PDF receipt...')}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
                  >
                    <Download size={13} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
import {
  BarChart3,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAnalyticsKPI, useAnalyticsTrend, useChannelBreakdown } from '@/hooks/useAnalytics';
import { ChannelBadge } from '@/components/common/ChannelBadge';
import { formatPercent, formatDelta, cn } from '@/lib/utils';

export function AnalyticsDashboard() {
  const { data: kpi, isLoading: kpiLoading } = useAnalyticsKPI();
  const { data: trend, isLoading: trendLoading } = useAnalyticsTrend();
  const { data: channels, isLoading: channelsLoading } = useChannelBreakdown();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-neutral-900">Analytics & Insights</h1>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
            Last 14 Days
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Performance across your Voice receptionist, WhatsApp bot, and Website booking widget.
        </p>
      </div>

      {/* KPI Cards Row */}
      {kpiLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calls */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Total Phone Calls</span>
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Phone size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-neutral-900">{kpi?.callsTotal}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={13} /> {formatDelta(kpi?.callsDelta || 0)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">vs. previous period</p>
          </div>

          {/* Messages */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">WhatsApp Messages</span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-neutral-900">{kpi?.messagesTotal}</span>
              <span className="text-xs font-semibold text-neutral-500 flex items-center gap-0.5">
                {formatDelta(kpi?.messagesDelta || 0)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">vs. previous period</p>
          </div>

          {/* Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Appointments Booked</span>
              <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Calendar size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-neutral-900">{kpi?.bookingsTotal}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={13} /> {formatDelta(kpi?.bookingsDelta || 0)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">across all channels</p>
          </div>

          {/* AI Resolution Rate */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">AI Resolution Rate</span>
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-neutral-900">
                {formatPercent(kpi?.aiResolutionRate || 0.84, 0)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp size={13} /> {formatDelta(kpi?.aiResolutionDelta || 0)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">resolved without human transfer</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Traffic & Engagement Volume</h2>
            <p className="text-xs text-neutral-400">Daily message and call interactions</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Calls
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> WhatsApp
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {trendLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-neutral-400" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area type="monotone" dataKey="messages" stroke="#10b981" fillOpacity={1} fill="url(#colorMessages)" />
                <Area type="monotone" dataKey="calls" stroke="#6366f1" fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Per-Channel Breakdown Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-900">Per-Channel Performance Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Channel</th>
                <th className="py-3.5 px-6">Total inquiries</th>
                <th className="py-3.5 px-6">AI automated</th>
                <th className="py-3.5 px-6">Escalated to team</th>
                <th className="py-3.5 px-6">Avg response duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {channels?.map((row) => (
                <tr key={row.channel} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <ChannelBadge channel={row.channel} size="md" />
                  </td>
                  <td className="py-4 px-6 font-bold text-neutral-900">{row.total}</td>
                  <td className="py-4 px-6 text-emerald-600 font-semibold">
                    {row.resolved} ({formatPercent(row.resolved / row.total, 0)})
                  </td>
                  <td className="py-4 px-6 text-amber-600 font-medium">
                    {row.escalated} ({formatPercent(row.escalated / row.total, 0)})
                  </td>
                  <td className="py-4 px-6 text-neutral-500 font-mono">
                    {row.avgDurationSeconds ? `${row.avgDurationSeconds}s` : '< 2s (instant)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

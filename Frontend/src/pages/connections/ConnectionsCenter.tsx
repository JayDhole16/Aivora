import React from 'react';
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Trash2,
  Plus,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useCredentials, useTestCredential, useDisconnectCredential } from '@/hooks/useCredentials';
import { StatusChip } from '@/components/common/StatusChip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ConnectionsCenter() {
  const { data: credentials, isLoading } = useCredentials();
  const testMutation = useTestCredential();
  const disconnectMutation = useDisconnectCredential();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900">Connections Center</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              Credential Vault
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Audit and verify all phone numbers, Meta WhatsApp links, and payment connections in one single place.
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-semibold block mb-0.5">Secure Encrypted Storage</span>
          All third-party connections are verified via secure OAuth links and encrypted keys. We never store raw passwords or plain text credentials.
        </div>
      </div>

      {/* Connections Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Provider</th>
                  <th className="py-3.5 px-6">Purpose</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Last validated</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {credentials?.map((cred) => (
                  <tr key={cred.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-neutral-900 flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold">
                        {cred.provider.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span>{cred.provider}</span>
                        {cred.metadata && (
                          <span className="block text-[11px] font-mono text-neutral-400 font-normal">
                            {Object.entries(cred.metadata)[0]?.[1] as string}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-neutral-600">{cred.purpose}</td>
                    <td className="py-4 px-6">
                      <StatusChip status={cred.status} />
                    </td>
                    <td className="py-4 px-6 text-neutral-500 font-mono text-[11px]">
                      {cred.lastValidatedAt ? new Date(cred.lastValidatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => testMutation.mutate(cred.id)}
                        disabled={testMutation.isPending}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-medium inline-flex items-center gap-1 text-[11px]"
                      >
                        <RefreshCw size={12} /> Test
                      </button>
                      <button
                        type="button"
                        onClick={() => disconnectMutation.mutate(cred.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors inline-flex"
                        aria-label="Disconnect"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

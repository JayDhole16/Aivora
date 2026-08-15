import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { useTeam, useInviteTeamMember, useUpdateMemberRole, useRemoveTeamMember } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { Role, TeamMember } from '@/types';
import { toast } from 'sonner';

export function TeamRoles() {
  const { data: user } = useAuth();
  const { data: team, isLoading } = useTeam();
  const inviteMutation = useInviteTeamMember();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMutation = useRemoveTeamMember();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('agent');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    await inviteMutation.mutateAsync({ email: inviteEmail, role: inviteRole });
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleRoleChange = (memberId: string, role: Role) => {
    updateRoleMutation.mutate({ memberId, role });
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900">Team & Access Control</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
              RBAC
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Invite your staff, agency partners, and managers with role-scoped permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
        >
          <UserPlus size={15} /> Invite team member
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { role: 'Owner', desc: 'Full billing, service deployment, and organizational control.' },
          { role: 'Admin', desc: 'Can edit services, knowledge base, and manage connections.' },
          { role: 'Agent', desc: 'Handles Unified Inbox and manages customer bookings.' },
          { role: 'Viewer', desc: 'Read-only access to analytics and performance metrics.' },
        ].map((r) => (
          <div key={r.role} className="bg-white p-4 rounded-xl border border-neutral-200 text-xs space-y-1">
            <span className="font-bold text-neutral-900 block">{r.role}</span>
            <p className="text-neutral-500 text-[11px] leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Team Member List */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Member</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Joined</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {team?.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{member.name}</p>
                      <p className="text-neutral-400 text-[11px]">{member.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={member.role}
                      disabled={member.role === 'owner'}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 outline-none disabled:bg-neutral-100"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="agent">Agent</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full font-medium text-[11px] border capitalize',
                        member.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-neutral-400 font-mono text-[11px]">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {member.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => removeMutation.mutate(member.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove team member"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <form
            onSubmit={handleInvite}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-neutral-200 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Invite Team Member</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@yourbusiness.com"
                className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Assigned permission role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl outline-none"
              >
                <option value="admin">Admin — Manage services & knowledge base</option>
                <option value="agent">Agent — Inbox & Appointment handling</option>
                <option value="viewer">Viewer — Read-only analytics</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs"
            >
              {inviteMutation.isPending && <Loader2 size={13} className="animate-spin" />}
              Send invitation
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

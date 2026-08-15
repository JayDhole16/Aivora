import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTeam, inviteTeamMember, updateTeamMemberRole, removeTeamMember } from '@/api/team';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useTeam() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['team', user?.orgId],
    queryFn: () => getTeam(user!.orgId),
    enabled: !!user,
  });
}

export function useInviteTeamMember() {
  const { data: user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: Parameters<typeof inviteTeamMember>[2] }) =>
      inviteTeamMember(user!.orgId, email, role),
    onSuccess: (member) => {
      qc.invalidateQueries({ queryKey: ['team'] });
      toast.success(`Invitation sent to ${member.email}.`);
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Parameters<typeof updateTeamMemberRole>[1] }) =>
      updateTeamMemberRole(memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] });
      toast.success('Role updated.');
    },
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeTeamMember(memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] });
      toast.success('Team member removed.');
    },
  });
}

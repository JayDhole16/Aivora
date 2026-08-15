import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCredentials, testCredential, disconnectCredential } from '@/api/credentials';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useCredentials() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['credentials', user?.orgId],
    queryFn: () => getCredentials(user!.orgId),
    enabled: !!user,
  });
}

export function useTestCredential() {
  return useMutation({
    mutationFn: (credId: string) => testCredential(credId),
    onSuccess: ({ success, message }) => {
      if (success) toast.success(message);
      else toast.error(message);
    },
  });
}

export function useDisconnectCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (credId: string) => disconnectCredential(credId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credentials'] });
      toast.success('Connection removed.');
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getKnowledgeBase, createKBEntry, updateKBEntry, deleteKBEntry, uploadKBDocument } from '@/api/knowledgeBase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useKnowledgeBase() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['knowledge-base', user?.orgId],
    queryFn: () => getKnowledgeBase(user!.orgId),
    enabled: !!user,
  });
}

export function useCreateKBEntry() {
  const { data: user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createKBEntry>[1]) => createKBEntry(user!.orgId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Entry added to your knowledge base.');
    },
  });
}

export function useUpdateKBEntry() {
  const { data: user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateKBEntry>[2] }) =>
      updateKBEntry(user!.orgId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Entry updated.');
    },
  });
}

export function useDeleteKBEntry() {
  const { data: user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteKBEntry(user!.orgId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge-base'] });
      toast.success('Entry removed.');
    },
  });
}

export function useUploadKBDocument() {
  const { data: user } = useAuth();
  return useMutation({
    mutationFn: (file: File) => uploadKBDocument(user!.orgId, file),
  });
}

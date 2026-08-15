import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversations, getMessages, takeOverConversation, sendMessage } from '@/api/conversations';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useConversations() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['conversations', user?.orgId],
    queryFn: () => getConversations(user!.orgId),
    enabled: !!user,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
  });
}

export function useTakeOver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => takeOverConversation(conversationId),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast.success(`You're now handling this conversation.`);
      return conv;
    },
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(conversationId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}

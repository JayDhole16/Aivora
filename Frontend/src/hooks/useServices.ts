import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices, getVoiceConfig, getWhatsAppConfig, getWebsiteConfig,
  updateVoiceConfig, updateWhatsAppConfig, updateWebsiteConfig,
  updateServiceStatus, createService, searchPhoneNumbers, provisionPhoneNumber,
  submitWhatsAppTemplate, publishWebsite, verifyDomain,
} from '@/api/services';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useServices() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['services', user?.orgId],
    queryFn: () => getServices(user!.orgId),
    enabled: !!user,
  });
}

export function useVoiceConfig(serviceId: string) {
  return useQuery({
    queryKey: ['voice-config', serviceId],
    queryFn: () => getVoiceConfig(serviceId),
    enabled: !!serviceId,
  });
}

export function useUpdateVoiceConfig(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateVoiceConfig>[1]) => updateVoiceConfig(serviceId, data),
    onSuccess: (updated) => {
      qc.setQueryData(['voice-config', serviceId], updated);
      toast.success('Changes saved.');
    },
  });
}

export function useWhatsAppConfig(serviceId: string) {
  return useQuery({
    queryKey: ['whatsapp-config', serviceId],
    queryFn: () => getWhatsAppConfig(serviceId),
    enabled: !!serviceId,
  });
}

export function useUpdateWhatsAppConfig(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateWhatsAppConfig>[1]) => updateWhatsAppConfig(serviceId, data),
    onSuccess: (updated) => {
      qc.setQueryData(['whatsapp-config', serviceId], updated);
      toast.success('Changes saved.');
    },
  });
}

export function useWebsiteConfig(serviceId: string) {
  return useQuery({
    queryKey: ['website-config', serviceId],
    queryFn: () => getWebsiteConfig(serviceId),
    enabled: !!serviceId,
  });
}

export function useUpdateWebsiteConfig(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateWebsiteConfig>[1]) => updateWebsiteConfig(serviceId, data),
    onSuccess: (updated) => {
      qc.setQueryData(['website-config', serviceId], updated);
      toast.success('Changes saved.');
    },
  });
}

export function useUpdateServiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, status }: { serviceId: string; status: Parameters<typeof updateServiceStatus>[1] }) =>
      updateServiceStatus(serviceId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service status updated.');
    },
  });
}

export function useCreateService() {
  const { data: user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createService>[1]) => createService(user!.orgId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function usePhoneNumberSearch() {
  return useMutation({
    mutationFn: (areaCode: string) => searchPhoneNumbers(areaCode),
  });
}

export function useProvisionPhoneNumber(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (number: string) => provisionPhoneNumber(number),
    onSuccess: ({ number }) => {
      qc.invalidateQueries({ queryKey: ['voice-config', serviceId] });
      toast.success(`Phone number ${number} is ready to use!`);
    },
  });
}

export function useSubmitWhatsAppTemplate(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof submitWhatsAppTemplate>[1]) => submitWhatsAppTemplate(serviceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['whatsapp-config', serviceId] });
      toast.success("Template submitted for approval. We'll notify you when it's reviewed.");
    },
  });
}

export function usePublishWebsite(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => publishWebsite(serviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website-config', serviceId] });
      qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Your website is live! 🎉');
    },
  });
}

export function useVerifyDomain(serviceId: string) {
  return useMutation({
    mutationFn: (domain: string) => verifyDomain(serviceId, domain),
    onSuccess: ({ verified }) => {
      if (verified) {
        toast.success('Domain verified! Your site is ready at your custom URL.');
      } else {
        toast.error("We couldn't verify the domain yet. DNS changes can take up to 48 hours.");
      }
    },
  });
}

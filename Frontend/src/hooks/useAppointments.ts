import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, getAppointmentServices, getStaff, updateAppointment, cancelAppointment } from '@/api/appointments';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useAppointments() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['appointments', user?.orgId],
    queryFn: () => getAppointments(user!.orgId),
    enabled: !!user,
  });
}

export function useAppointmentServices() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['appointment-services', user?.orgId],
    queryFn: () => getAppointmentServices(user!.orgId),
    enabled: !!user,
  });
}

export function useStaff() {
  const { data: user } = useAuth();
  return useQuery({
    queryKey: ['staff', user?.orgId],
    queryFn: () => getStaff(user!.orgId),
    enabled: !!user,
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (apptId: string) => cancelAppointment(apptId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment cancelled.');
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAppointment>[1] }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment updated.');
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMe, login, signup, logout } from '@/api/auth';
import { toast } from 'sonner';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => login(email, otp),
    onSuccess: (user) => {
      qc.setQueryData(['auth', 'me'], user);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    },
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      signup(name, email, password),
    onSuccess: (user) => {
      qc.setQueryData(['auth', 'me'], user);
      toast.success("Account created! Let's set up your business.");
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.clear();
      window.location.href = '/auth/login';
    },
  });
}

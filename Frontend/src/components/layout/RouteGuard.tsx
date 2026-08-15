import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function RouteGuard({ children, requireOnboarding = true }: RouteGuardProps) {
  const { data: user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/auth/login', { replace: true });
      } else if (requireOnboarding && !user.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, isLoading, navigate, requireOnboarding]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm text-neutral-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireOnboarding && !user.onboardingCompleted) return null;

  return <>{children}</>;
}

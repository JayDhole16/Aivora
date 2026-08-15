import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';
import { RouteGuard } from '@/components/layout/RouteGuard';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { OnboardingWizard } from '@/pages/onboarding/OnboardingWizard';
import { DashboardHome } from '@/pages/dashboard/DashboardHome';
import { VoiceBuilder } from '@/pages/voice/VoiceBuilder';
import { WhatsAppBuilder } from '@/pages/whatsapp/WhatsAppBuilder';
import { WebsiteBuilder } from '@/pages/website/WebsiteBuilder';
import { UnifiedInbox } from '@/pages/inbox/UnifiedInbox';
import { AppointmentsCalendar } from '@/pages/appointments/AppointmentsCalendar';
import { AnalyticsDashboard } from '@/pages/analytics/AnalyticsDashboard';
import { ConnectionsCenter } from '@/pages/connections/ConnectionsCenter';
import { TeamRoles } from '@/pages/team/TeamRoles';
import { BillingPlan } from '@/pages/billing/BillingPlan';
import { SettingsPage } from '@/pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />

            {/* Onboarding Wizard (protected by auth, but not gated by onboardingCompleted) */}
            <Route
              path="/onboarding"
              element={
                <RouteGuard requireOnboarding={false}>
                  <OnboardingWizard />
                </RouteGuard>
              }
            />

            {/* Main Application (AppShell Layout) */}
            <Route path="/dashboard" element={<AppShell />}>
              <Route index element={<DashboardHome />} />
              <Route path="inbox" element={<UnifiedInbox />} />
              <Route path="appointments" element={<AppointmentsCalendar />} />
              <Route path="voice" element={<VoiceBuilder />} />
              <Route path="whatsapp" element={<WhatsAppBuilder />} />
              <Route path="website" element={<WebsiteBuilder />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="connections" element={<ConnectionsCenter />} />
              <Route path="team" element={<TeamRoles />} />
              <Route path="billing" element={<BillingPlan />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback to /dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

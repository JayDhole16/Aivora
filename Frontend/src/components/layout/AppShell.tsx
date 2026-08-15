import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { RouteGuard } from './RouteGuard';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/inbox': 'Inbox',
  '/dashboard/appointments': 'Appointments',
  '/dashboard/voice': 'Voice receptionist',
  '/dashboard/whatsapp': 'WhatsApp assistant',
  '/dashboard/website': 'Website',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/connections': 'Connections',
  '/dashboard/team': 'Team',
  '/dashboard/billing': 'Billing & plan',
  '/dashboard/settings': 'Settings',
};

export function AppShell() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Aivora';

  return (
    <RouteGuard>
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar title={title} />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}

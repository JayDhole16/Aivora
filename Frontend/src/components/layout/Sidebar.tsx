import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Phone, MessageCircle, Globe, Inbox,
  Calendar, BarChart3, Plug, Users, CreditCard, Settings,
  Zap, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  minRole?: Role; // minimum role required to see this item
  badge?: string;
}

const ROLE_WEIGHT: Record<Role, number> = { viewer: 0, agent: 1, admin: 2, owner: 3 };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', href: '/dashboard/inbox', icon: Inbox, minRole: 'agent' },
  { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar, minRole: 'agent' },
  { label: 'Voice receptionist', href: '/dashboard/voice', icon: Phone, minRole: 'admin' },
  { label: 'WhatsApp assistant', href: '/dashboard/whatsapp', icon: MessageCircle, minRole: 'admin' },
  { label: 'Website', href: '/dashboard/website', icon: Globe, minRole: 'admin' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Connections', href: '/dashboard/connections', icon: Plug, minRole: 'admin' },
  { label: 'Team', href: '/dashboard/team', icon: Users, minRole: 'admin' },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard, minRole: 'owner' },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, minRole: 'admin' },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { data: user } = useAuth();
  const location = useLocation();
  const userRole = user?.role ?? 'viewer';

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.minRole) return true;
    return ROLE_WEIGHT[userRole] >= ROLE_WEIGHT[item.minRole];
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white border-r border-neutral-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-neutral-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 flex-shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-neutral-900 text-sm tracking-tight">Aivora</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard'}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              )}
            >
              <Icon
                size={18}
                className={cn(
                  'flex-shrink-0',
                  active ? 'text-indigo-600' : 'text-neutral-400 group-hover:text-neutral-600',
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && active && (
                <ChevronRight size={14} className="ml-auto text-indigo-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      {!collapsed && user && (
        <div className="border-t border-neutral-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex-shrink-0">
              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-neutral-900 truncate">{user.name}</p>
              <p className="text-xs text-neutral-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

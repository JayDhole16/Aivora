import React from 'react';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { data: user } = useAuth();
  const logoutMutation = useLogout();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-neutral-200 flex-shrink-0">
      <div>
        {title && <h1 className="text-sm font-semibold text-neutral-900">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              dropdownOpen ? 'bg-neutral-100' : 'hover:bg-neutral-50',
            )}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
              {user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span className="text-neutral-700 font-medium hidden sm:block">{user?.name.split(' ')[0]}</span>
            <ChevronDown size={14} className="text-neutral-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg py-1 z-50"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-xs font-medium text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-400">{user?.email}</p>
              </div>
              <button
                onClick={() => { setDropdownOpen(false); logoutMutation.mutate(); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                role="menuitem"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

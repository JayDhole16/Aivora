import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const CHANNEL_COLORS = {
  voice: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    solid: 'bg-indigo-600',
    hex: '#6366f1',
  },
  whatsapp: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    solid: 'bg-emerald-600',
    hex: '#10b981',
  },
  website: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    solid: 'bg-sky-600',
    hex: '#0ea5e9',
  },
  website_chat: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    solid: 'bg-sky-600',
    hex: '#0ea5e9',
  },
} as const;

export const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  testing: { label: 'Testing', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  live: { label: 'Live', color: 'bg-green-100 text-green-700 border-green-200' },
  paused: { label: 'Paused', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  not_connected: { label: 'Not connected', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  pending_verification: { label: 'Pending verification', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  connected: { label: 'Connected', color: 'bg-green-100 text-green-700 border-green-200' },
  needs_attention: { label: 'Needs attention', color: 'bg-red-100 text-red-700 border-red-200' },
} as const;

export const VERTICAL_LABELS: Record<string, string> = {
  salon: 'Salon & Beauty',
  clinic: 'Clinic & Healthcare',
  restaurant: 'Restaurant & Food',
  gym: 'Gym & Fitness',
  real_estate: 'Real Estate',
  home_services: 'Home Services',
  other: 'Other',
};

export const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
export const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

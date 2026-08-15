import React from 'react';
import { Phone, MessageCircle, Globe } from 'lucide-react';
import { cn, CHANNEL_COLORS } from '@/lib/utils';
import type { ServiceType } from '@/types';

type Channel = ServiceType | 'website_chat' | 'voice' | 'whatsapp';

interface ChannelBadgeProps {
  channel: Channel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const CHANNEL_META: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  voice: { label: 'Voice', icon: Phone },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
  website: { label: 'Website', icon: Globe },
  website_chat: { label: 'Website chat', icon: Globe },
};

const SIZE_CLASSES = {
  sm: { wrapper: 'px-2 py-0.5 text-xs gap-1', icon: 14 },
  md: { wrapper: 'px-2.5 py-1 text-sm gap-1.5', icon: 16 },
  lg: { wrapper: 'px-3 py-1.5 text-sm gap-2', icon: 18 },
};

export function ChannelBadge({ channel, size = 'md', showLabel = true, className }: ChannelBadgeProps) {
  const meta = CHANNEL_META[channel] ?? CHANNEL_META.website;
  const colors = CHANNEL_COLORS[channel as keyof typeof CHANNEL_COLORS] ?? CHANNEL_COLORS.website;
  const sizes = SIZE_CLASSES[size];
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border',
        colors.bg,
        colors.text,
        colors.border,
        sizes.wrapper,
        className,
      )}
    >
      <Icon size={sizes.icon} />
      {showLabel && meta.label}
    </span>
  );
}

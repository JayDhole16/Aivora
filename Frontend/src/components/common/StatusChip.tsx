import React from 'react';
import { cn, STATUS_CONFIG } from '@/lib/utils';
import type { ServiceStatus, ConnectionStatus } from '@/types';

type Status = ServiceStatus | ConnectionStatus;

interface StatusChipProps {
  status: Status;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.color,
        className,
      )}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-green-500': status === 'live' || status === 'connected',
          'bg-amber-500': status === 'testing' || status === 'pending_verification',
          'bg-red-500': status === 'needs_attention',
          'bg-orange-500': status === 'paused',
          'bg-neutral-400': status === 'draft' || status === 'not_connected',
        })}
      />
      {config.label}
    </span>
  );
}

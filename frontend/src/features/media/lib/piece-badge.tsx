/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { cn } from '@/lib/utils';
import { normalizeMediaStatus, type MediaStatus } from '../types/media-piece';

const PILL =
  'inline-flex h-7 items-center whitespace-nowrap rounded-full px-3 py-0 text-xs font-medium leading-none';

const TONE: Record<MediaStatus, { fill: string; dot: string }> = {
  not_started: { fill: 'bg-stone-200 text-stone-800', dot: '#78716c' },
  editing: { fill: 'bg-sky-100 text-sky-900', dot: '#0284c7' },
  revision: { fill: 'bg-rose-100 text-rose-900', dot: '#e11d48' },
  caption: { fill: 'bg-orange-100 text-orange-900', dot: '#ea580c' },
  ready_for_review: { fill: 'bg-amber-100 text-amber-950', dot: '#d97706' },
  under_review: { fill: 'bg-lime-100 text-lime-950', dot: '#65a30d' },
  ready_for_publish: { fill: 'bg-emerald-100 text-emerald-900', dot: '#059669' },
  scheduled_post: { fill: 'bg-violet-100 text-violet-900', dot: '#7c3aed' },
  published: { fill: 'bg-teal-100 text-teal-900', dot: '#0f766e' },
  not_published: { fill: 'bg-red-100 text-red-900', dot: '#dc2626' },
};

export function statusTone(status: MediaStatus | string) {
  return TONE[normalizeMediaStatus(status)];
}

export function statusBadgeClass(status: MediaStatus | string): string {
  return cn(PILL, statusTone(status).fill);
}

export function statusDotColor(status: MediaStatus | string): string {
  return statusTone(status).dot;
}

export function statusChipStyle(status: MediaStatus | string): { backgroundColor: string; color: string } {
  const hex = statusDotColor(status);
  return { backgroundColor: `${hex}22`, color: hex };
}

export function StatusSwatch({ status, className }: { status: MediaStatus | string; className?: string }) {
  return (
    <span
      className={cn('inline-block shrink-0', className)}
      style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: statusDotColor(status) }}
      aria-hidden
    />
  );
}

export function StatusPill({
  status,
  label,
  className,
}: {
  status: MediaStatus | string;
  label: string;
  className?: string;
}) {
  return (
    <span className={cn(statusBadgeClass(status), 'gap-1.5', className)}>
      <StatusSwatch status={status} />
      {label}
    </span>
  );
}

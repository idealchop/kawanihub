/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { getMediaCopy } from '../lib/media-copy';
import { MEDIA_KPI_IDS, type MediaKpiId } from '../lib/piece-kpis';

const TONE: Record<MediaKpiId, string> = {
  in_edit: 'bg-sky-500',
  in_review: 'bg-amber-500',
  ready_to_post: 'bg-emerald-500',
  due_today: 'bg-rose-500',
};

export function MediaKpiCards({
  counts,
  total,
  selected = null,
  onSelect,
  locale,
}: {
  counts: Record<MediaKpiId, number>;
  total: number;
  selected?: MediaKpiId | null;
  onSelect?: (id: MediaKpiId | null) => void;
  locale?: AppLocale;
}) {
  const mediaCopy = getMediaCopy(locale);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {MEDIA_KPI_IDS.map((id) => {
        const value = counts[id];
        const active = selected === id;
        const width = total > 0 ? Math.round((value / total) * 100) : 0;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect?.(active ? null : id)}
            aria-pressed={active}
            className="min-w-0 text-left"
          >
            <Card
              className={cn(
                'h-full overflow-hidden transition-colors hover:bg-accent/40',
                active && 'border-primary ring-1 ring-primary',
              )}
            >
              <div className={cn('h-1', TONE[id])} />
              <CardHeader className="space-y-1 p-3.5 sm:p-4">
                <CardDescription className="text-xs leading-snug">{mediaCopy.kpis[id].label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums tracking-tight">{value}</CardTitle>
                <p className="text-xs text-muted-foreground">{mediaCopy.kpis[id].hint}</p>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full rounded-full', TONE[id])} style={{ width: `${width}%` }} />
                </div>
              </CardHeader>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

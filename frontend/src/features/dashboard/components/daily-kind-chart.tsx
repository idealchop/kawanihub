/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { SOLICITATION_KINDS, type SolicitationKind } from '@/features/solicitation/types/solicitation';
import { KIND_COLORS } from '../lib/las-pinas-map-model';
import type { DailyKindPoint } from '../lib/map-briefing';

function tickLabel(day: string): string {
  const [, month, date] = day.split('-');
  return `${Number(month)}/${Number(date)}`;
}

function tickIndexes(length: number): Set<number> {
  if (length <= 5) return new Set(Array.from({ length }, (_, index) => index));
  return new Set([0, Math.round((length - 1) / 3), Math.round(((length - 1) * 2) / 3), length - 1]);
}

export function DailyKindChart({
  points,
  kindLabels,
  empty,
  title,
}: {
  points: DailyKindPoint[];
  kindLabels: Record<SolicitationKind, string>;
  empty: string;
  title: string;
}) {
  const max = Math.max(
    1,
    ...points.flatMap((point) => SOLICITATION_KINDS.map((kind) => point.counts[kind])),
  );
  const visibleKinds = SOLICITATION_KINDS.filter((kind) => points.some((point) => point.counts[kind] > 0));
  const kinds = visibleKinds.length > 0 ? visibleKinds : SOLICITATION_KINDS;
  const ticks = tickIndexes(points.length);

  if (visibleKinds.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
        <p className="py-4 text-sm text-muted-foreground">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {kinds.map((kind) => {
          const total = points.reduce((sum, point) => sum + point.counts[kind], 0);
          return (
            <div key={kind} className="grid grid-cols-[4.75rem_minmax(0,1fr)_1.25rem] items-center gap-2">
              <p className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: KIND_COLORS[kind] }} />
                <span className="truncate">{kindLabels[kind]}</span>
              </p>
              <div className="flex h-5 items-end gap-[3px]">
                {points.map((point) => {
                  const count = point.counts[kind];
                  const height = count > 0 ? Math.max(3, Math.round((count / max) * 20)) : 0;
                  return (
                    <div
                      key={point.day}
                      className="flex h-full min-w-0 flex-1 items-end"
                      title={`${tickLabel(point.day)} · ${kindLabels[kind]} ${count}`}
                    >
                      <div
                        className="w-full rounded-[2px]"
                        style={{
                          height,
                          backgroundColor: count > 0 ? KIND_COLORS[kind] : 'transparent',
                          boxShadow: count > 0 ? undefined : 'inset 0 -1px 0 0 rgb(15 23 42 / 0.08)',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-right text-[11px] tabular-nums text-muted-foreground">{total}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-[4.75rem_minmax(0,1fr)_1.25rem] gap-2">
        <span />
        <div className="flex gap-[3px] text-[10px] text-muted-foreground">
          {points.map((point, index) => (
            <span key={point.day} className="min-w-0 flex-1 text-center">
              {ticks.has(index) ? tickLabel(point.day) : ''}
            </span>
          ))}
        </div>
        <span />
      </div>
    </div>
  );
}

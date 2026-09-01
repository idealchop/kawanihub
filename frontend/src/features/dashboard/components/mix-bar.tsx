/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { cn } from '@/lib/utils';

export function MixBar({
  items,
  formatValue,
  showLegend = true,
  legendClassName,
}: {
  items: { key: string; label: string; value: number; color: string }[];
  formatValue?: (value: number) => string;
  showLegend?: boolean;
  legendClassName?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {items.map((item) =>
          item.value > 0 ? (
            <div
              key={item.key}
              className="h-full min-w-0"
              style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
              title={`${item.label} ${formatValue ? formatValue(item.value) : item.value}`}
            />
          ) : null,
        )}
      </div>
      {showLegend ? (
        <ul
          className={cn(
            'grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3',
            legendClassName,
          )}
        >
          {items.map((item) => (
            <li key={item.key} className="flex min-w-0 items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="shrink-0 tabular-nums">{formatValue ? formatValue(item.value) : item.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

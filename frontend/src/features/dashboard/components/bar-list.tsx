/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import Link from 'next/link';
import type { CountMap } from '../types/analytics';

export function BarList({
  items,
  labels,
  emptyLabel,
  hrefFor,
  hideZero = false,
}: {
  items: CountMap;
  labels?: Record<string, string>;
  emptyLabel: string;
  hrefFor?: (key: string) => string;
  hideZero?: boolean;
}) {
  const entries = Object.entries(items)
    .filter(([, value]) => (hideZero ? value > 0 : true))
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const max = Math.max(1, ...entries.map(([, value]) => value));

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        const label = labels?.[key] ?? key;
        const href = hrefFor?.(key);
        const row = (
          <>
            <div className="flex items-center justify-between text-sm">
              <span>{label}</span>
              <span className="tabular-nums text-muted-foreground">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((value / max) * 100)}%` }} />
            </div>
          </>
        );

        if (!href) {
          return (
            <div key={key} className="space-y-1">
              {row}
            </div>
          );
        }

        return (
          <Link key={key} href={href} className="block space-y-1 rounded-md hover:opacity-80">
            {row}
          </Link>
        );
      })}
    </div>
  );
}

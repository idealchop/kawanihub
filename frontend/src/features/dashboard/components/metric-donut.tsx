/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

export function MetricDonut({
  value,
  total,
  center,
  label,
  doneLabel,
  pendingLabel,
  color = '#0f766e',
}: {
  value: number;
  total: number;
  center?: string;
  label: string;
  doneLabel: string;
  pendingLabel: string;
  color?: string;
}) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(1, Math.max(0, value / safeTotal));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3">
      <svg viewBox="0 0 88 88" className="size-[5.5rem] shrink-0" role="img" aria-label={label}>
        <circle cx="44" cy="44" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
        <text
          x="44"
          y="44"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-[15px] font-semibold"
        >
          {center ?? value}
        </text>
      </svg>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground">
          <span className="tabular-nums text-foreground">{value}</span> {doneLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="tabular-nums text-foreground">{Math.max(0, total - value)}</span> {pendingLabel}
        </p>
      </div>
    </div>
  );
}

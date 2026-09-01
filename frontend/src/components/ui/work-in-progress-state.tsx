/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { cn } from '@/lib/utils';

export function WorkInProgressState({
  title,
  message,
  className,
}: {
  title: string;
  message: string;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto flex w-full max-w-5xl flex-col gap-6', className)}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-dashed px-6 py-16 text-center">
        <div className="wip-scene" aria-hidden="true">
          <span className="wip-dot" />
          <span className="wip-dot" />
          <span className="wip-dot" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
          <div className="wip-bar h-full rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

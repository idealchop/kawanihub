/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative flex size-9 shrink-0 overflow-hidden rounded-full bg-muted', className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('flex size-full items-center justify-center text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback };

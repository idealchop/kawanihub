/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { copyrightLine } from '@/config/brand';
import { cn } from '@/lib/utils';

export function CopyrightNotice({ className }: { className?: string }) {
  return <p className={cn('text-xs text-muted-foreground', className)}>{copyrightLine()}</p>;
}

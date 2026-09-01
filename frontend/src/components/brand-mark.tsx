/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';
import { cn } from '@/lib/utils';

export function BrandMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
        style={{ backgroundColor: brand.colors.primary }}
      >
        {brand.shortName.slice(0, 1)}
      </span>
      <span className={inverted ? 'text-white' : 'text-foreground'}>{brand.productName}</span>
    </span>
  );
}

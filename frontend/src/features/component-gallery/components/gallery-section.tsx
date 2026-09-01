/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function GallerySection({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className={cn('rounded-xl border bg-card p-4 md:p-6', className)}>{children}</div>
    </section>
  );
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import type { AppLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { contentTypeBadgeClass } from '../lib/content-type-badge';
import { ContentTypeIcon } from '../lib/content-type-icons';
import { getMediaCopy } from '../lib/media-copy';
import { isActiveContentType, type MediaContentType } from '../types/media-content-type';

function TypeCard({ row }: { row: MediaContentType }) {
  return (
    <>
      <span className={cn('inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm font-semibold', contentTypeBadgeClass(row.icon))}>
        <ContentTypeIcon icon={row.icon} className="size-3.5" />
        {row.name}
      </span>
      {row.hint ? <span className="text-xs text-muted-foreground">{row.hint}</span> : null}
    </>
  );
}

const cardClass = (selected: boolean) =>
  cn(
    'flex min-h-20 flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-colors',
    selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent',
  );

export function MediaTypePicker({
  types,
  value,
  onChange,
  hrefFor,
  locale,
}: {
  types: MediaContentType[];
  value?: string | null;
  onChange?: (slug: string) => void;
  hrefFor?: (slug: string) => string;
  locale?: AppLocale;
}) {
  const mediaCopy = getMediaCopy(locale);
  const visible = hrefFor ? types.filter((row) => isActiveContentType(row) || row.slug === value) : types.filter(isActiveContentType);

  if (visible.length === 0) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{mediaCopy.typePickerLabel}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {visible.map((row) => {
          const selected = value === row.slug;
          if (hrefFor) {
            return (
              <Link key={row.id} href={hrefFor(row.slug)} className={cardClass(selected)} aria-current={selected ? 'page' : undefined}>
                <TypeCard row={row} />
              </Link>
            );
          }
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onChange?.(row.slug)}
              aria-pressed={selected}
              className={cardClass(selected)}
            >
              <TypeCard row={row} />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocale } from '@/features/locale';
import { ContentTypeIcon } from '../lib/content-type-icons';
import { getMediaCopy } from '../lib/media-copy';
import { visibleMediaTypeIcons, type MediaTypeIcon } from '../lib/media-type-icon-catalog';

export function MediaTypeIconPicker({
  value,
  usedIcons,
  onChange,
}: {
  value: MediaTypeIcon;
  usedIcons: readonly string[];
  onChange: (icon: MediaTypeIcon) => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const [query, setQuery] = useState('');
  const icons = useMemo(() => visibleMediaTypeIcons(query, usedIcons, value), [query, usedIcons, value]);

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{mediaCopy.typeIconLabel}</legend>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={mediaCopy.iconSearchPlaceholder}
          aria-label={mediaCopy.iconSearchPlaceholder}
          className="pl-8"
        />
      </div>
      {icons.length === 0 ? (
        <p className="text-sm text-muted-foreground">{mediaCopy.iconSearchEmpty}</p>
      ) : (
        <div className="grid max-h-40 grid-cols-5 gap-2 overflow-y-auto">
          {icons.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={value === key}
              aria-label={key}
              onClick={() => onChange(key)}
              className={cn(
                'flex size-10 items-center justify-center rounded-lg border',
                value === key ? 'border-primary bg-primary/10' : 'hover:bg-accent',
              )}
            >
              <ContentTypeIcon icon={key} className="size-4" />
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}

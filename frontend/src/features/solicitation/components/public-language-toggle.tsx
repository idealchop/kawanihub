/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { type AppLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { getLocaleCopy, useLocale } from '@/features/locale';

const PORTAL_LOCALES: AppLocale[] = ['fil', 'en'];

export function PublicLanguageToggle() {
  const { locale, setLocale } = useLocale();
  const copy = getLocaleCopy(locale);

  return (
    <div className="inline-flex rounded-xl border bg-background p-1" role="group" aria-label={copy.language}>
      {PORTAL_LOCALES.map((option) => {
        const selected = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option as AppLocale)}
            className={cn(
              'min-h-11 min-w-14 rounded-lg px-3 text-sm font-semibold',
              selected ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
            )}
            aria-pressed={selected}
          >
            {option === 'fil' ? 'FIL' : 'EN'}
          </button>
        );
      })}
    </div>
  );
}

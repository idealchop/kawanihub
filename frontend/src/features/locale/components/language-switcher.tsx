/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APP_LOCALES, type AppLocale } from '@/lib/locale';
import { getLocaleCopy } from '../lib/locale-copy';
import { useLocale } from '../hooks/use-locale';

export function LanguageSwitcher({ id = 'app-language' }: { id?: string }) {
  const { locale, setLocale } = useLocale();
  const copy = getLocaleCopy(locale);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="sr-only">
        {copy.language}
      </Label>
      <Select value={locale} onValueChange={(value) => setLocale(value as AppLocale)}>
        <SelectTrigger id={id} className="h-8 w-[8.5rem]" aria-label={copy.language}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {APP_LOCALES.map((option) => (
            <SelectItem key={option} value={option}>
              {option === 'en' ? copy.english : copy.filipino}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

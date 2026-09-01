/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { htmlLang, persistLocale, resolveUiLocale, type AppLocale } from '@/lib/locale';
import { LocaleContext } from '../hooks/use-locale';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<AppLocale>(() => resolveUiLocale(pathname));

  useEffect(() => {
    setLocaleState(resolveUiLocale(pathname));
  }, [pathname]);

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    persistLocale(next);
    setLocaleState(next);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

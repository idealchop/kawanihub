/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { createContext, useContext } from 'react';
import { DEFAULT_LOCALE, type AppLocale } from '@/lib/locale';

export type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
});

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { memoryStore } from '@/lib/memory-store';

export const APP_LOCALES = ['en', 'fil'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'en';
export const PORTAL_DEFAULT_LOCALE: AppLocale = 'fil';

const LOCALE_KEY = 'app.locale';

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'en' || value === 'fil';
}

export function getLocale(): AppLocale {
  const stored = memoryStore.get<string>(LOCALE_KEY);
  return isAppLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function resolveUiLocale(pathname: string): AppLocale {
  const stored = memoryStore.get<string>(LOCALE_KEY);
  if (isAppLocale(stored)) return stored;
  return pathname.startsWith('/solicit') ? PORTAL_DEFAULT_LOCALE : DEFAULT_LOCALE;
}

export function persistLocale(locale: AppLocale): void {
  memoryStore.set(LOCALE_KEY, locale);
}

export function pickCopy<T>(dictionary: Record<AppLocale, T>, locale: AppLocale = getLocale()): T {
  return dictionary[locale] ?? dictionary[DEFAULT_LOCALE];
}

export function htmlLang(locale: AppLocale): string {
  return locale === 'fil' ? 'fil' : 'en';
}

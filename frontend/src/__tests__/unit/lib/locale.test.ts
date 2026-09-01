/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, persistLocale, resolveUiLocale } from '@/lib/locale';
import { memoryStore } from '@/lib/memory-store';

describe('resolveUiLocale', () => {
  afterEach(() => {
    memoryStore.clear();
  });

  it('defaults the public portal to Filipino', () => {
    expect(resolveUiLocale('/solicit')).toBe('fil');
    expect(resolveUiLocale('/solicit/request')).toBe('fil');
  });

  it('keeps the desk on the app default', () => {
    expect(resolveUiLocale('/overview')).toBe(DEFAULT_LOCALE);
  });

  it('honors a stored language everywhere', () => {
    persistLocale('en');
    expect(resolveUiLocale('/solicit')).toBe('en');
  });
});

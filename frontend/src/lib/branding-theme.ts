/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';

export function applyBrandThemeToDocument(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--primary', brand.colors.primary);
  root.style.setProperty('--primary-foreground', brand.colors.primaryForeground);
  root.style.setProperty('--ring', brand.colors.ring);
}

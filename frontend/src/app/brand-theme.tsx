/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect } from 'react';
import { applyBrandThemeToDocument } from '@/lib/branding-theme';

export function BrandTheme() {
  useEffect(() => {
    applyBrandThemeToDocument();
  }, []);
  return null;
}

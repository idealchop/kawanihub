/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { WorkInProgressState } from '@/components/ui/work-in-progress-state';
import { useLocale } from '@/features/locale';
import { getLegislativeCopy } from '../lib/legislative-copy';

export function LegislativePanel() {
  const { locale } = useLocale();
  const copy = getLegislativeCopy(locale);

  return <WorkInProgressState title={copy.title} message={copy.workInProgress} />;
}

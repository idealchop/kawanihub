/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { WorkInProgressState } from '@/components/ui/work-in-progress-state';
import { useLocale } from '@/features/locale';
import { getAssistantCopy } from '../lib/assistant-copy';

export function AssistantPanel() {
  const { locale } = useLocale();
  const copy = getAssistantCopy(locale);

  return <WorkInProgressState title={copy.title} message={copy.workInProgress} />;
}

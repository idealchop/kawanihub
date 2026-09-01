/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { MediaStatus } from '../types/media-piece';
import { dayKey } from './piece-calendar';

export function statusFromDates(shootDate: string, publishDate: string, today = dayKey(new Date())): MediaStatus {
  if (publishDate && publishDate <= today) return 'published';
  if (shootDate && shootDate <= today) return 'editing';
  return 'not_started';
}

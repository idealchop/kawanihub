/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getMediaCopy } from '../lib/media-copy';
import { listRecentMediaEvents } from '../services/media-activity-api';
import type { MediaPieceEvent } from '../types/media-history';
import { MEDIA_RECENT_PAGE_SIZE } from '../types/media-history';

export function useRecentMediaEvents() {
  const [events, setEvents] = useState<MediaPieceEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const listed = await listRecentMediaEvents(1, MEDIA_RECENT_PAGE_SIZE);
      setEvents(listed.events);
      setTotal(listed.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : getMediaCopy().loadError);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    const unsubscribe = liveSync.subscribe(() => {
      void refresh(true);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  return { events, total, loading, error };
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getMediaCopy } from '../lib/media-copy';
import { listMediaHistory } from '../services/media-activity-api';
import type { MediaPieceEvent } from '../types/media-history';
import { MEDIA_HISTORY_PAGE_SIZE } from '../types/media-history';

export function useMediaHistory(pieceId: string | null) {
  const [events, setEvents] = useState<MediaPieceEvent[]>([]);
  const [paging, setPaging] = useState({ id: pieceId, page: 1 });
  const page = paging.id === pieceId ? paging.page : 1;
  const setPage = useCallback((next: number) => setPaging({ id: pieceId, page: next }), [pieceId]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(MEDIA_HISTORY_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (silent = false) => {
      if (!pieceId) {
        setEvents([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      setError(null);
      try {
        const listed = await listMediaHistory(pieceId, page);
        setEvents(listed.events);
        setTotal(listed.total);
        setPageSize(listed.pageSize);
      } catch (err) {
        setError(err instanceof Error ? err.message : getMediaCopy().loadError);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, pieceId],
  );

  useEffect(() => {
    if (!pieceId) return;
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
  }, [pieceId, refresh]);

  return { events, page, pageSize, total, loading, error, setPage };
}

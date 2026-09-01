/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getMediaCopy } from '../lib/media-copy';
import {
  createMediaContentType,
  deleteMediaContentType,
  listMediaContentTypes,
  updateMediaContentType,
} from '../services/media-content-types-api';
import type { MediaContentType } from '../types/media-content-type';

export function useMediaContentTypes() {
  const [types, setTypes] = useState<MediaContentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTypes(await listMediaContentTypes());
    } catch (err) {
      setError(err instanceof Error ? err.message : getMediaCopy().loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    const unsubscribe = liveSync.subscribe(() => {
      void refresh();
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  return { types, loading, error, refresh, createMediaContentType, updateMediaContentType, deleteMediaContentType };
}

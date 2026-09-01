/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getDashboardCopy } from '../lib/dashboard-copy';
import { getAnalytics } from '../services/analytics-api';
import type { AnalyticsSnapshot } from '../types/analytics';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalytics(await getAnalytics());
    } catch (err) {
      setError(err instanceof Error ? err.message : getDashboardCopy().loadError);
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

  return { analytics, loading, error, refresh };
}

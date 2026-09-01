/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getNotificationsCopy } from '../lib/notifications-copy';
import {
  createNotification,
  deleteNotification,
  listNotifications,
  updateNotification,
} from '../services/notifications-api';
import type { DeskNotification, NotificationWriteInput } from '../types/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<DeskNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNotifications(await listNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : getNotificationsCopy().loadError);
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

  return { notifications, loading, error, refresh, createNotification, updateNotification, deleteNotification };
}

export type { NotificationWriteInput };

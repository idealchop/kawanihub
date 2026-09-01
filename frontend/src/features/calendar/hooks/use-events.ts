/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getCalendarCopy } from '../lib/calendar-copy';
import { createEvent, deleteEvent, listEvents, updateEvent } from '../services/events-api';
import type { DeskEvent, EventWriteInput } from '../types/event';

export function useEvents() {
  const [events, setEvents] = useState<DeskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await listEvents());
    } catch (err) {
      setError(err instanceof Error ? err.message : getCalendarCopy().loadError);
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

  return { events, loading, error, refresh, createEvent, updateEvent, deleteEvent };
}

export type { EventWriteInput };

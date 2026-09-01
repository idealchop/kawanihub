/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getCalendarCopy } from '../lib/calendar-copy';
import { addMonths, dayKey, eventDayKey, isSameMonth, isToday, monthGrid, monthLabel } from '../lib/calendar-grid';
import { useEvents } from '../hooks/use-events';
import { EventForm } from './event-form';
import type { DeskEvent } from '../types/event';

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function CalendarBoard() {
  const { locale } = useLocale();
  const calendarCopy = getCalendarCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { events, loading, error, createEvent, deleteEvent } = useEvents();
  const [anchor, setAnchor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const days = useMemo(() => monthGrid(anchor), [anchor]);

  const byDay = useMemo(() => {
    const map = new Map<string, DeskEvent[]>();
    for (const event of events) {
      const key = eventDayKey(event.startsAt);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  async function remove(row: DeskEvent) {
    try {
      await deleteEvent(row.id);
      toast.success(calendarCopy.deleted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.deleteFailed);
    }
  }

  const monthEvents = events.filter((event) => isSameMonth(new Date(event.startsAt), anchor));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{calendarCopy.title}</h1>
        <p className="text-sm text-muted-foreground">{calendarCopy.description}</p>
      </div>

      <EventForm onCreate={createEvent} />

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAnchor((current) => addMonths(current, -1))}>
            {chrome.previous}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAnchor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
            {calendarCopy.today}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAnchor((current) => addMonths(current, 1))}>
            {chrome.next}
          </Button>
        </div>
        <p className="text-sm font-medium">{monthLabel(anchor)}</p>
      </div>

      <div className="hidden overflow-hidden rounded-xl border md:block">
        <div className="grid grid-cols-7 bg-muted/50 text-center text-xs font-medium text-muted-foreground">
          {calendarCopy.weekdays.map((day) => (
            <div key={day} className="px-2 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = dayKey(day);
            const dayEvents = byDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={cn(
                  'min-h-24 border-t border-r p-2 last:border-r-0',
                  !isSameMonth(day, anchor) && 'bg-muted/30 text-muted-foreground',
                  isToday(day) && 'bg-primary/5',
                )}
              >
                <p className={cn('text-xs', isToday(day) && 'font-semibold text-primary')}>{day.getDate()}</p>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <p key={event.id} className="truncate rounded bg-primary/10 px-1 py-0.5 text-[11px]">
                      {event.title}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!loading && monthEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground">{calendarCopy.empty}</p>
      ) : null}

      <div className="grid gap-3">
        {monthEvents.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>
                {formatTime(event.startsAt)}
                {event.location ? ` · ${event.location}` : ''}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex-wrap justify-between gap-2">
              <Badge variant="outline">{calendarCopy.kinds[event.kind]}</Badge>
              <Button size="sm" variant="destructive" onClick={() => void remove(event)}>
                {calendarCopy.delete}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

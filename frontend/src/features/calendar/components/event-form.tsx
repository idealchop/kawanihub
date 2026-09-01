/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getCalendarCopy } from '../lib/calendar-copy';
import type { EventKind, EventWriteInput } from '../types/event';

function toLocalInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventForm({ onCreate }: { onCreate: (input: EventWriteInput) => Promise<unknown> }) {
  const { locale } = useLocale();
  const calendarCopy = getCalendarCopy(locale);
  const chrome = getLocaleCopy(locale);
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState(toLocalInput(start));
  const [endsAt, setEndsAt] = useState(toLocalInput(end));
  const [location, setLocation] = useState('');
  const [kind, setKind] = useState<EventKind>('meeting');
  const [notes, setNotes] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await onCreate({
        title,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        location,
        kind,
        notes,
      });
      setTitle('');
      setLocation('');
      setNotes('');
      setKind('meeting');
      toast.success(calendarCopy.created);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="event-title">{calendarCopy.titleLabel}</Label>
        <Input id="event-title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-kind">{calendarCopy.kindLabel}</Label>
        <Select value={kind} onValueChange={(value) => setKind(value as EventKind)}>
          <SelectTrigger id="event-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(calendarCopy.kinds) as EventKind[]).map((key) => (
              <SelectItem key={key} value={key}>
                {calendarCopy.kinds[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-start">{calendarCopy.startLabel}</Label>
        <Input id="event-start" type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-end">{calendarCopy.endLabel}</Label>
        <Input id="event-end" type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-location">{calendarCopy.locationLabel}</Label>
        <Input id="event-location" value={location} onChange={(event) => setLocation(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event-notes">{calendarCopy.notesLabel}</Label>
        <Input id="event-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? chrome.saving : calendarCopy.add}
        </Button>
      </div>
    </form>
  );
}

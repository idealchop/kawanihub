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
import { getNotificationsCopy } from '../lib/notifications-copy';
import type { NotificationKind, NotificationWriteInput } from '../types/notification';

export function NotificationForm({ onCreate }: { onCreate: (input: NotificationWriteInput) => Promise<unknown> }) {
  const { locale } = useLocale();
  const notificationsCopy = getNotificationsCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<NotificationKind>('user');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await onCreate({ title, body, kind });
      setTitle('');
      setBody('');
      setKind('user');
      toast.success(notificationsCopy.created);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="notice-title">{notificationsCopy.titleLabel}</Label>
        <Input id="notice-title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notice-kind">{notificationsCopy.kindLabel}</Label>
        <Select value={kind} onValueChange={(value) => setKind(value as NotificationKind)}>
          <SelectTrigger id="notice-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(notificationsCopy.kinds) as NotificationKind[]).map((key) => (
              <SelectItem key={key} value={key}>
                {notificationsCopy.kinds[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notice-body">{notificationsCopy.bodyLabel}</Label>
        <Input id="notice-body" value={body} onChange={(event) => setBody(event.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? chrome.saving : notificationsCopy.add}
        </Button>
      </div>
    </form>
  );
}

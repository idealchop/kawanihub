/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { itemsCopy } from '../lib/items-copy';
import type { ItemWriteInput } from '../types/item';

export function ItemForm({ onCreate }: { onCreate: (input: ItemWriteInput) => Promise<unknown> }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await onCreate({ title, notes });
      setTitle('');
      setNotes('');
      toast.success('Item created.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create item.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <div className="space-y-2">
        <Label htmlFor="item-title">{itemsCopy.titleLabel}</Label>
        <Input id="item-title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="item-notes">{itemsCopy.notesLabel}</Label>
        <Input id="item-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : itemsCopy.add}
      </Button>
    </form>
  );
}

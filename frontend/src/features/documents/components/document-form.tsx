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
import { getDocumentsCopy } from '../lib/documents-copy';
import type { DocumentKind, DocumentWriteInput } from '../types/document';

export function DocumentForm({ onCreate }: { onCreate: (input: DocumentWriteInput) => Promise<unknown> }) {
  const { locale } = useLocale();
  const documentsCopy = getDocumentsCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [title, setTitle] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [requester, setRequester] = useState('');
  const [barangay, setBarangay] = useState('');
  const [kind, setKind] = useState<DocumentKind>('request');
  const [dueAt, setDueAt] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await onCreate({ title, referenceNo, requester, barangay, kind, dueAt, notes });
      setTitle('');
      setReferenceNo('');
      setRequester('');
      setBarangay('');
      setKind('request');
      setDueAt('');
      setNotes('');
      toast.success(documentsCopy.created);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="doc-title">{documentsCopy.titleLabel}</Label>
        <Input id="doc-title" required value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-ref">{documentsCopy.referenceLabel}</Label>
        <Input id="doc-ref" value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-requester">{documentsCopy.requesterLabel}</Label>
        <Input id="doc-requester" required value={requester} onChange={(event) => setRequester(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-barangay">{documentsCopy.barangayLabel}</Label>
        <Input id="doc-barangay" value={barangay} onChange={(event) => setBarangay(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-kind">{documentsCopy.kindLabel}</Label>
        <Select value={kind} onValueChange={(value) => setKind(value as DocumentKind)}>
          <SelectTrigger id="doc-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(documentsCopy.kinds) as DocumentKind[]).map((key) => (
              <SelectItem key={key} value={key}>
                {documentsCopy.kinds[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-due">{documentsCopy.dueLabel}</Label>
        <Input id="doc-due" type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="doc-notes">{documentsCopy.notesLabel}</Label>
        <Input id="doc-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? chrome.saving : documentsCopy.add}
        </Button>
      </div>
    </form>
  );
}

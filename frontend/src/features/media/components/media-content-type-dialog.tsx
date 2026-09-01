/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { MediaTypeIconPicker } from './media-type-icon-picker';
import { getMediaCopy } from '../lib/media-copy';
import type { MediaContentType, MediaContentTypeWriteInput, MediaTypeIcon } from '../types/media-content-type';

const FORM_ID = 'media-content-type-form';

function TypeForm({
  row,
  usedIcons,
  onSave,
  onClose,
}: {
  row: MediaContentType | null;
  usedIcons: readonly string[];
  onSave: (input: MediaContentTypeWriteInput) => Promise<unknown>;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [name, setName] = useState(row?.name ?? '');
  const [hint, setHint] = useState(row?.hint ?? '');
  const [icon, setIcon] = useState<MediaTypeIcon>(row?.icon ?? 'camera');
  const [active, setActive] = useState(row ? row.status === 'active' : true);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await onSave({
        name,
        hint,
        icon,
        status: active ? 'active' : 'inactive',
      });
      toast.success(row ? mediaCopy.typeUpdated : mediaCopy.typeCreated);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{row ? mediaCopy.editTypeTitle : mediaCopy.addTypeTitle}</DialogTitle>
        <DialogDescription>{mediaCopy.typeFormDescription}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <form id={FORM_ID} onSubmit={onSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="media-type-name">{mediaCopy.typeNameLabel}</Label>
            <Input id="media-type-name" required value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="media-type-hint">{mediaCopy.typeHintLabel}</Label>
            <Input
              id="media-type-hint"
              value={hint}
              placeholder={mediaCopy.typeHintPlaceholder}
              onChange={(event) => setHint(event.target.value)}
            />
          </div>
          <MediaTypeIconPicker value={icon} usedIcons={usedIcons} onChange={setIcon} />
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="media-type-active">{mediaCopy.typeActive}</Label>
            <Switch id="media-type-active" checked={active} onCheckedChange={setActive} />
          </div>
        </form>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          {mediaCopy.cancel}
        </Button>
        <Button type="submit" form={FORM_ID} disabled={pending}>
          {pending ? chrome.saving : mediaCopy.save}
        </Button>
      </DialogFooter>
    </>
  );
}

export function MediaContentTypeDialog({
  row,
  usedIcons,
  open,
  onOpenChange,
  onCreate,
  onUpdate,
}: {
  row: MediaContentType | null;
  usedIcons: readonly string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: MediaContentTypeWriteInput) => Promise<unknown>;
  onUpdate: (typeId: string, input: MediaContentTypeWriteInput) => Promise<unknown>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? (
          <TypeForm
            key={row?.id ?? 'new'}
            row={row}
            usedIcons={usedIcons}
            onSave={(input) => (row ? onUpdate(row.id, input) : onCreate(input))}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

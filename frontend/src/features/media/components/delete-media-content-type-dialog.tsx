/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
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
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getMediaCopy, withPieceName } from '../lib/media-copy';
import type { MediaContentType } from '../types/media-content-type';

export function DeleteMediaContentTypeDialog({
  row,
  open,
  onOpenChange,
  onDelete,
}: {
  row: MediaContentType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (typeId: string) => Promise<unknown>;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [pending, setPending] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setPending(false);
    onOpenChange(next);
  }

  async function confirmDelete() {
    if (!row) return;
    setPending(true);
    try {
      await onDelete(row.id);
      toast.success(mediaCopy.typeDeleted);
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.deleteFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mediaCopy.deleteTypeTitle}</DialogTitle>
          <DialogDescription>{withPieceName(mediaCopy.deleteTypeDescription, row?.name ?? '')}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">{row?.hint}</p>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            {mediaCopy.cancel}
          </Button>
          <Button type="button" variant="destructive" onClick={() => void confirmDelete()} disabled={pending || !row}>
            {pending ? chrome.saving : mediaCopy.confirmDelete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

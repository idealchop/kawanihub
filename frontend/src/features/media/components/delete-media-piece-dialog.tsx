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
import { formatPieceDate } from '../lib/format-piece-date';
import { getMediaCopy, withPieceName } from '../lib/media-copy';
import type { MediaPiece } from '../types/media-piece';

export function DeleteMediaPieceDialog({
  piece,
  open,
  onOpenChange,
  onDelete,
}: {
  piece: MediaPiece | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (pieceId: string) => Promise<unknown>;
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
    if (!piece) return;
    setPending(true);
    try {
      await onDelete(piece.id);
      toast.success(mediaCopy.deleted);
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.deleteFailed);
    } finally {
      setPending(false);
    }
  }

  const when = piece?.publishDate || piece?.shootDate || '';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mediaCopy.deleteTitle}</DialogTitle>
          <DialogDescription>{withPieceName(mediaCopy.deleteDescription, piece?.title ?? '')}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">{when ? formatPieceDate(when, locale) : ''}</p>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            {mediaCopy.cancel}
          </Button>
          <Button type="button" variant="destructive" onClick={() => void confirmDelete()} disabled={pending || !piece}>
            {pending ? chrome.saving : mediaCopy.confirmDelete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

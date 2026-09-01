/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

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
import type { Member } from '@/features/users/types/member';
import { formatActivityWhen, formatHistoryEvent } from '../lib/format-history-event';
import { getMediaCopy } from '../lib/media-copy';
import { personNames } from '../lib/piece-person';
import { useMediaHistory } from '../hooks/use-media-history';
import type { MediaPiece } from '../types/media-piece';
import { MediaActivityPager } from './media-activity-pager';

export function MediaPieceHistoryDialog({
  piece,
  members,
  open,
  onOpenChange,
}: {
  piece: MediaPiece | null;
  members: Member[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { events, page, pageSize, total, loading, error, setPage } = useMediaHistory(open && piece ? piece.id : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {piece ? (
          <>
            <DialogHeader>
              <DialogTitle>{mediaCopy.historyTitle}</DialogTitle>
              <DialogDescription>
                {piece.title}. {mediaCopy.historyDescription}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {!loading && !error && events.length === 0 ? (
                <p className="text-sm text-muted-foreground">{mediaCopy.historyEmpty}</p>
              ) : null}
              <ol className="grid gap-3">
                {events.map((event) => (
                  <li key={event.id} className="border-l-2 border-border pl-3">
                    <p className="text-sm">
                      {formatHistoryEvent(event, mediaCopy, (uids) => personNames(members, uids, ''))}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatActivityWhen(event.createdAt, locale)}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-4">
                <MediaActivityPager page={page} pageSize={pageSize} total={total} onPage={setPage} />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {mediaCopy.close}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

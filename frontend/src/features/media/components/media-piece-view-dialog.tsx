/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { ArrowRight, ExternalLink, Pencil } from 'lucide-react';
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
import { useAuth } from '@/features/auth-ui/hooks/use-auth';
import { useLocale } from '@/features/locale';
import type { Member } from '@/features/users/types/member';
import { cn } from '@/lib/utils';
import { formatPieceDate } from '../lib/format-piece-date';
import { formatMediaOpenAge, getMediaCopy } from '../lib/media-copy';
import {
  formatMediaOpenDuration,
  pieceNeedsAttention,
  pieceOpenUntil,
} from '../lib/piece-attention';
import { StatusPill } from '../lib/piece-badge';
import { personNames } from '../lib/piece-person';
import { ContentTypeChip } from './content-type-chip';
import { MediaPieceComments } from './media-piece-comments';
import type { MediaContentType } from '../types/media-content-type';
import type { MediaPiece } from '../types/media-piece';

function DateFact({ label, value, align = 'start' }: { label: string; value: string; align?: 'start' | 'end' }) {
  return (
    <div className={cn('min-w-0 sm:flex-1', align === 'end' && 'sm:text-right')}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-medium tracking-tight">{value}</p>
    </div>
  );
}

function PersonFact({ label, value, empty }: { label: string; value: string; empty: string }) {
  const assigned = Boolean(value);
  return (
    <div className="min-w-0 rounded-xl border bg-muted/20 px-4 py-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1.5 truncate text-sm font-medium', !assigned && 'font-normal text-muted-foreground')}>
        {assigned ? value : empty}
      </p>
    </div>
  );
}

function AssetLink({ href, label }: { href: string; label: string }) {
  return (
    <Button type="button" variant="outline" size="sm" asChild>
      <a href={href} target="_blank" rel="noreferrer">
        <ExternalLink />
        {label}
      </a>
    </Button>
  );
}

export function MediaPieceViewDialog({
  piece,
  types,
  members,
  open,
  onOpenChange,
  onEdit,
  onHistory,
}: {
  piece: MediaPiece | null;
  types: MediaContentType[];
  members: Member[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (piece: MediaPiece) => void;
  onHistory: (piece: MediaPiece) => void;
}) {
  const { locale } = useLocale();
  const { session } = useAuth();
  const mediaCopy = getMediaCopy(locale);
  const attention = piece ? pieceNeedsAttention(piece) : false;
  const openAge = piece ? formatMediaOpenDuration(piece.createdAt, pieceOpenUntil(piece)) : null;
  const openLabel = openAge ? formatMediaOpenAge(mediaCopy, openAge) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl">
        {piece ? (
          <>
            <DialogHeader className="space-y-3 py-5">
              <DialogTitle>{piece.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <ContentTypeChip types={types} slug={piece.type} />
                <StatusPill status={piece.status} label={mediaCopy.statuses[piece.status]} />
              </div>
              <DialogDescription className={attention ? 'sr-only' : undefined}>
                {openLabel || mediaCopy.statuses[piece.status]}
              </DialogDescription>
              {attention ? (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
                  <span className="font-medium text-destructive">{mediaCopy.needsAttention}</span>
                  {openLabel ? <span className="text-muted-foreground"> · {openLabel}</span> : null}
                </p>
              ) : null}
            </DialogHeader>
            <DialogBody className="px-6 py-6">
              <div className="space-y-8">
                {piece.shootDate || piece.publishDate ? (
                  <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    {piece.shootDate ? (
                      <DateFact label={mediaCopy.shoot} value={formatPieceDate(piece.shootDate, locale)} />
                    ) : null}
                    {piece.shootDate && piece.publishDate ? (
                      <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
                    ) : null}
                    {piece.publishDate ? (
                      <DateFact
                        label={mediaCopy.publish}
                        value={formatPieceDate(piece.publishDate, locale)}
                        align={piece.shootDate ? 'end' : 'start'}
                      />
                    ) : null}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-3">
                  <PersonFact
                    label={mediaCopy.editorLabel}
                    value={personNames(members, piece.editorUids, '')}
                    empty={mediaCopy.notAssigned}
                  />
                  <PersonFact
                    label={mediaCopy.reviewerLabel}
                    value={personNames(members, piece.reviewerUids, '')}
                    empty={mediaCopy.notAssigned}
                  />
                  <PersonFact
                    label={mediaCopy.deployedLabel}
                    value={personNames(members, piece.deployedUids, '')}
                    empty={mediaCopy.notAssigned}
                  />
                </div>

                {piece.caption ? (
                  <p className="text-[15px] leading-7 whitespace-pre-wrap">{piece.caption}</p>
                ) : null}

                {piece.subs ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{mediaCopy.subsLabel}</p>
                    <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">{piece.subs}</p>
                  </div>
                ) : null}

                {piece.episode || piece.driveUrl || piece.fbUrl ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {piece.episode ? (
                      <span className="inline-flex h-9 items-center rounded-lg border bg-background px-3.5 text-xs font-medium">
                        {mediaCopy.episodeLabel} {piece.episode}
                      </span>
                    ) : null}
                    {piece.driveUrl ? <AssetLink href={piece.driveUrl} label={mediaCopy.openDrive} /> : null}
                    {piece.fbUrl ? <AssetLink href={piece.fbUrl} label={mediaCopy.openFacebook} /> : null}
                  </div>
                ) : null}

                {open ? (
                  <MediaPieceComments pieceId={piece.id} members={members} actorUid={session?.uid} compact />
                ) : null}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {mediaCopy.close}
              </Button>
              <Button type="button" variant="outline" onClick={() => onHistory(piece)}>
                {mediaCopy.history}
              </Button>
              <Button type="button" onClick={() => onEdit(piece)}>
                <Pencil />
                {mediaCopy.edit}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

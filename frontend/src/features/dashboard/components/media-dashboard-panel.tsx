/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { useMediaContentTypes } from '@/features/media/hooks/use-media-content-types';
import { useMediaPieces } from '@/features/media/hooks/use-media-pieces';
import { formatMediaOpenAge, getMediaCopy } from '@/features/media/lib/media-copy';
import { formatActivityWhen, formatHistoryEvent } from '@/features/media/lib/format-history-event';
import { personLoad, type PersonDeskRole } from '@/features/media/lib/media-desk-stats';
import { formatMediaOpenDuration } from '@/features/media/lib/piece-attention';
import { personName, personNames } from '@/features/media/lib/piece-person';
import { useRecentMediaEvents } from '@/features/media/hooks/use-recent-media-events';
import { useMembers } from '@/features/users/hooks/use-members';
import { MediaOpenQueue } from './media-open-queue';
import { MediaProductivitySection } from './media-productivity-section';
import { getDashboardCopy } from '../lib/dashboard-copy';

export function MediaDashboardPanel() {
  const { locale } = useLocale();
  const dashboardCopy = getDashboardCopy(locale);
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { pieces, loading, error } = useMediaPieces();
  const { types } = useMediaContentTypes();
  const { members } = useMembers();
  const recent = useRecentMediaEvents();
  const now = new Date();
  const holding = personLoad(pieces, now);
  const roleLabel: Record<PersonDeskRole, string> = {
    editor: mediaCopy.editorLabel,
    reviewer: mediaCopy.reviewerLabel,
    deployer: mediaCopy.deployedLabel,
  };

  if (loading) return <p className="text-sm text-muted-foreground">{chrome.loading}</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{dashboardCopy.mediaHint}</p>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/media">{dashboardCopy.mediaBoard}</Link>
        </Button>
      </div>

      {pieces.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dashboardCopy.mediaEmpty}</p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
        <MediaOpenQueue pieces={pieces} members={members} locale={locale} now={now} />

        <div className="flex min-w-0 flex-col gap-3">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{dashboardCopy.mediaRecentTitle}</CardTitle>
              <CardDescription>{dashboardCopy.mediaRecentHint}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto p-4 pt-0">
              {recent.loading ? (
                <p className="text-sm text-muted-foreground">{chrome.loading}</p>
              ) : null}
              {recent.error ? <p className="text-sm text-destructive">{recent.error}</p> : null}
              {!recent.loading && recent.events.length === 0 ? (
                <p className="text-sm text-muted-foreground">{dashboardCopy.mediaRecentEmpty}</p>
              ) : (
                <ul className="divide-y">
                  {recent.events.map((event) => {
                    const live = pieces.find((row) => row.id === event.pieceId);
                    const title = live?.title || event.payload.title || dashboardCopy.mediaMissingPiece;
                    const line = formatHistoryEvent(event, mediaCopy, (uids) => personNames(members, uids, ''));
                    const body = (
                      <span className="flex min-w-0 flex-col gap-0.5 py-2.5">
                        <span className="truncate font-medium">{title}</span>
                        <span className="text-sm text-muted-foreground">{line}</span>
                        <span className="text-xs text-muted-foreground">{formatActivityWhen(event.createdAt, locale)}</span>
                      </span>
                    );
                    return (
                      <li key={event.id}>
                        {live ? (
                          <Link href="/media" className="block hover:bg-accent/40">
                            {body}
                          </Link>
                        ) : (
                          body
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{dashboardCopy.mediaHoldingTitle}</CardTitle>
              <CardDescription>{dashboardCopy.mediaHoldingHint}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-80 overflow-y-auto p-4 pt-0">
              {holding.length === 0 ? (
                <p className="text-sm text-muted-foreground">{dashboardCopy.mediaHoldingEmpty}</p>
              ) : (
                <ul className="divide-y">
                  {holding.map((row) => {
                    const oldest = row.oldestCreatedAt ? formatMediaOpenDuration(row.oldestCreatedAt) : null;
                    const oldestLabel = oldest ? formatMediaOpenAge(mediaCopy, oldest) : dashboardCopy.mediaHoldingNone;
                    return (
                      <li
                        key={row.uid || 'unassigned'}
                        className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {row.uid ? personName(members, row.uid, row.uid) : dashboardCopy.mediaUnassigned}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {row.roles.map((role) => roleLabel[role]).join(' · ') || dashboardCopy.mediaUnassigned}
                          </span>
                        </span>
                        <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-end">
                          <span>
                            <span className="tabular-nums tracking-tight text-foreground">{row.open}</span>{' '}
                            {dashboardCopy.mediaHoldingOpen}
                          </span>
                          <span>
                            <span className="tabular-nums tracking-tight text-foreground">{row.closedThisMonth}</span>{' '}
                            {dashboardCopy.mediaHoldingClosed}
                          </span>
                          <span>
                            {dashboardCopy.mediaHoldingOldest}{' '}
                            <span className="tabular-nums tracking-tight text-foreground">{oldestLabel}</span>
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MediaProductivitySection pieces={pieces} types={types} locale={locale} now={now} />
    </div>
  );
}

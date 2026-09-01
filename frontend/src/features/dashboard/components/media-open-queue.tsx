/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paginateRows } from '@/components/ui/lib/data-table-model';
import { getDataTableCopy } from '@/components/ui/lib/data-table-copy';
import { formatPieceDate } from '@/features/media/lib/format-piece-date';
import { formatMediaOpenAge, getMediaCopy } from '@/features/media/lib/media-copy';
import {
  listOpenPieces,
  OPEN_MEDIA_STATUSES,
  type OpenPieceSort,
} from '@/features/media/lib/media-desk-stats';
import { formatMediaOpenDuration, pieceNeedsAttention } from '@/features/media/lib/piece-attention';
import { StatusPill } from '@/features/media/lib/piece-badge';
import { personNames } from '@/features/media/lib/piece-person';
import { MediaActivityPager } from '@/features/media/components/media-activity-pager';
import type { MediaPiece, MediaStatus } from '@/features/media/types/media-piece';
import type { Member } from '@/features/users/types/member';
import type { AppLocale } from '@/lib/locale';
import { getDashboardCopy } from '../lib/dashboard-copy';

const ALL = '__all__';
const PAGE_SIZE = 10;

const SORT_OPTIONS: OpenPieceSort[] = [
  'open_oldest',
  'open_newest',
  'shoot_asc',
  'shoot_desc',
  'publish_asc',
  'publish_desc',
];

export function MediaOpenQueue({
  pieces,
  members,
  locale,
  now = new Date(),
}: {
  pieces: MediaPiece[];
  members: Member[];
  locale: AppLocale;
  now?: Date;
}) {
  const dashboardCopy = getDashboardCopy(locale);
  const mediaCopy = getMediaCopy(locale);
  const tableCopy = getDataTableCopy(locale);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<OpenPieceSort>('open_oldest');
  const [page, setPage] = useState(1);

  const openRows = useMemo(
    () => listOpenPieces(pieces, { status: status as MediaStatus | '', sort }),
    [pieces, sort, status],
  );
  const pageRows = useMemo(() => paginateRows(openRows, page, PAGE_SIZE), [openRows, page]);

  useEffect(() => {
    setPage(1);
  }, [sort, status]);

  const sortLabel: Record<OpenPieceSort, string> = {
    open_oldest: dashboardCopy.mediaOpenSortOpenOldest,
    open_newest: dashboardCopy.mediaOpenSortOpenNewest,
    shoot_asc: dashboardCopy.mediaOpenSortShootAsc,
    shoot_desc: dashboardCopy.mediaOpenSortShootDesc,
    publish_asc: dashboardCopy.mediaOpenSortPublishAsc,
    publish_desc: dashboardCopy.mediaOpenSortPublishDesc,
  };

  return (
    <Card className="min-w-0 lg:row-span-1">
      <CardHeader className="space-y-3 p-4 pb-2">
        <div>
          <CardTitle className="text-base">{dashboardCopy.mediaOpenTitle}</CardTitle>
          <CardDescription>
            {dashboardCopy.mediaOpenHint} {openRows.length ? dashboardCopy.mediaOpenCount(openRows.length) : ''}
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-36 space-y-1">
            <Label htmlFor="media-open-status" className="text-xs">
              {dashboardCopy.filterStatus}
            </Label>
            <Select value={status || ALL} onValueChange={(value) => setStatus(value === ALL ? '' : value)}>
              <SelectTrigger id="media-open-status" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{tableCopy.allFilter}</SelectItem>
                {OPEN_MEDIA_STATUSES.map((row) => (
                  <SelectItem key={row} value={row}>
                    {mediaCopy.statuses[row]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-44 space-y-1">
            <Label htmlFor="media-open-sort" className="text-xs">
              {dashboardCopy.mediaOpenSort}
            </Label>
            <Select value={sort} onValueChange={(value) => setSort(value as OpenPieceSort)}>
              <SelectTrigger id="media-open-sort" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {sortLabel[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {openRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {status ? dashboardCopy.mediaOpenFilteredEmpty : dashboardCopy.mediaOpenEmpty}
          </p>
        ) : (
          <>
            <ul className="divide-y">
              {pageRows.map((piece) => {
                const open = formatMediaOpenDuration(piece.createdAt);
                const openLabel = open ? formatMediaOpenAge(mediaCopy, open) : '';
                const attention = pieceNeedsAttention(piece, now);
                const who = personNames(members, piece.editorUids, '');
                return (
                  <li key={piece.id}>
                    <Link
                      href="/media"
                      className="flex flex-col gap-1 py-2.5 hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{piece.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {[
                            openLabel,
                            who,
                            piece.shootDate ? `${mediaCopy.shoot} ${formatPieceDate(piece.shootDate, locale)}` : '',
                            piece.publishDate
                              ? `${mediaCopy.publish} ${formatPieceDate(piece.publishDate, locale)}`
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                        {attention ? (
                          <span className="block text-xs font-medium text-destructive">{mediaCopy.needsAttention}</span>
                        ) : null}
                      </span>
                      <StatusPill status={piece.status} label={mediaCopy.statuses[piece.status]} />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <MediaActivityPager page={page} pageSize={PAGE_SIZE} total={openRows.length} onPage={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

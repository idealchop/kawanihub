/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { contentTypeLabel } from '@/features/media/lib/content-type-lookup';
import { getMediaCopy } from '@/features/media/lib/media-copy';
import {
  countClosedInRange,
  countDatesInRange,
  countPiecesByStatus,
  countPiecesByType,
  filterPiecesByCreatedRange,
  mediaProductivityRings,
  remainingOpenByDay,
  typeMixColor,
  type MediaDeskRange,
} from '@/features/media/lib/media-desk-stats';
import { dayKey, startOfMonth } from '@/features/media/lib/piece-calendar';
import { statusDotColor } from '@/features/media/lib/piece-badge';
import { MEDIA_STATUSES, type MediaPiece } from '@/features/media/types/media-piece';
import type { MediaContentType } from '@/features/media/types/media-content-type';
import type { AppLocale } from '@/lib/locale';
import { getDashboardCopy } from '../lib/dashboard-copy';
import { MetricDonut } from './metric-donut';
import { MixBar } from './mix-bar';
import { RemainingOpenChart } from './remaining-open-chart';

const RING_COLORS = {
  closed: '#0f766e',
  open: '#0284c7',
  attention: '#e11d48',
  published: '#059669',
} as const;

export function MediaProductivitySection({
  pieces,
  types,
  locale,
  now = new Date(),
}: {
  pieces: MediaPiece[];
  types: MediaContentType[];
  locale: AppLocale;
  now?: Date;
}) {
  const dashboardCopy = getDashboardCopy(locale);
  const mediaCopy = getMediaCopy(locale);
  const [from, setFrom] = useState(() => dayKey(startOfMonth(now)));
  const [to, setTo] = useState(() => dayKey(now));
  const range = useMemo<MediaDeskRange>(() => ({ from, to }), [from, to]);
  const scoped = useMemo(() => filterPiecesByCreatedRange(pieces, range), [pieces, range]);
  const rings = useMemo(() => mediaProductivityRings(pieces, range, now), [pieces, range, now]);
  const remaining = useMemo(() => remainingOpenByDay(pieces, now, range), [pieces, now, range]);
  const dates = useMemo(() => countDatesInRange(pieces, range), [pieces, range]);
  const closed = useMemo(() => countClosedInRange(pieces, range), [pieces, range]);
  const byStatus = useMemo(() => countPiecesByStatus(scoped), [scoped]);
  const byType = useMemo(() => countPiecesByType(scoped), [scoped]);
  const remainingNow = remaining[remaining.length - 1]?.open ?? 0;

  const ringCopy = {
    closed: {
      label: dashboardCopy.mediaRingClosed,
      done: dashboardCopy.mediaRingDone,
      pending: dashboardCopy.mediaRingPending,
    },
    open: {
      label: dashboardCopy.mediaRingOpen,
      done: dashboardCopy.mediaRingOpenNow,
      pending: dashboardCopy.mediaRingClosedScope,
    },
    attention: {
      label: dashboardCopy.mediaRingAttention,
      done: dashboardCopy.mediaRingAttentionNow,
      pending: dashboardCopy.mediaRingClear,
    },
    published: {
      label: dashboardCopy.mediaRingPublished,
      done: dashboardCopy.mediaRingPublishedNow,
      pending: dashboardCopy.mediaRingNotPublished,
    },
  } as const;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium tracking-tight">{dashboardCopy.mediaProductivityTitle}</h2>
          <p className="text-sm text-muted-foreground">{dashboardCopy.mediaProductivityHint}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="media-range-from" className="text-xs">
              {dashboardCopy.filterFrom}
            </Label>
            <Input
              id="media-range-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-9 w-[10.5rem]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="media-range-to" className="text-xs">
              {dashboardCopy.filterTo}
            </Label>
            <Input
              id="media-range-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-9 w-[10.5rem]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rings.map((ring) => {
          const copy = ringCopy[ring.id];
          return (
            <MetricDonut
              key={ring.id}
              value={ring.value}
              total={ring.total}
              label={copy.label}
              doneLabel={copy.done}
              pendingLabel={copy.pending}
              color={RING_COLORS[ring.id]}
            />
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">{dashboardCopy.mediaRemainingTitle}</CardTitle>
            <CardDescription>{dashboardCopy.mediaRemainingHint}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            <RemainingOpenChart
              points={remaining}
              label={dashboardCopy.mediaRemainingTitle}
              empty={dashboardCopy.mediaRemainingEmpty}
            />
            <p className="text-sm text-muted-foreground">
              <span className="text-2xl tabular-nums tracking-tight text-foreground">{remainingNow}</span>{' '}
              {dashboardCopy.mediaRemainingNow}
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{dashboardCopy.mediaDatesTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 p-4 pt-0">
              <div>
                <p className="text-xs text-muted-foreground">{dashboardCopy.mediaWeekShoot}</p>
                <p className="text-2xl tabular-nums tracking-tight">{dates.shoot}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{dashboardCopy.mediaWeekPublish}</p>
                <p className="text-2xl tabular-nums tracking-tight">{dates.publish}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">{dashboardCopy.mediaClosedTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 p-4 pt-0">
              <div>
                <p className="text-xs text-muted-foreground">{mediaCopy.statuses.published}</p>
                <p className="text-2xl tabular-nums tracking-tight">{closed.published}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{mediaCopy.statuses.not_published}</p>
                <p className="text-2xl tabular-nums tracking-tight">{closed.notPublished}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">{dashboardCopy.mediaPipeline}</CardTitle>
            <CardDescription>{dashboardCopy.mediaPipelineHint}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <MixBar
              items={MEDIA_STATUSES.filter((status) => byStatus[status] > 0).map((status) => ({
                key: status,
                label: mediaCopy.statuses[status],
                value: byStatus[status],
                color: statusDotColor(status),
              }))}
              legendClassName="lg:grid-cols-2"
            />
            {scoped.length === 0 ? <p className="text-sm text-muted-foreground">{dashboardCopy.mediaEmpty}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">{dashboardCopy.mediaTypes}</CardTitle>
            <CardDescription>{dashboardCopy.mediaTypesHint}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <MixBar
              items={byType.map((row) => ({
                key: row.type,
                label: contentTypeLabel(types, row.type),
                value: row.count,
                color: typeMixColor(row.type),
              }))}
            />
            {byType.length === 0 ? <p className="text-sm text-muted-foreground">{dashboardCopy.mediaEmpty}</p> : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

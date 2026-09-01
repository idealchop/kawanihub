/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { useMembers } from '@/features/users/hooks/use-members';
import { DeleteMediaPieceDialog } from './delete-media-piece-dialog';
import { MediaKpiCards } from './media-kpi-cards';
import { MediaPieceBoard } from './media-piece-board';
import { MediaPieceCalendar } from './media-piece-calendar';
import { MediaPieceDialog } from './media-piece-dialog';
import {
  EMPTY_MEDIA_FILTERS,
  MediaPieceFilters,
  mediaFilterRange,
  type MediaPieceFilterValues,
} from './media-piece-filters';
import { MediaPieceHistoryDialog } from './media-piece-history-dialog';
import { MediaPieceTable } from './media-piece-table';
import { MediaPieceViewDialog } from './media-piece-view-dialog';
import { contentTypeBySlug, contentTypeLabel } from '../lib/content-type-lookup';
import { getMediaCopy, withPieceName } from '../lib/media-copy';
import { compareMediaQueue } from '../lib/piece-attention';
import { filterMediaPieces, pieceSearchText } from '../lib/piece-filters';
import type { CalendarPlot } from '../lib/piece-calendar';
import { countMediaKpis, pieceMatchesKpi, type MediaKpiId } from '../lib/piece-kpis';
import { personNames } from '../lib/piece-person';
import { useMediaContentTypes } from '../hooks/use-media-content-types';
import { useMediaPieces } from '../hooks/use-media-pieces';
import type { MediaPiece, MediaPieceWriteInput } from '../types/media-piece';

type PieceAction =
  | { type: 'create'; date?: string }
  | { type: 'view'; piece: MediaPiece }
  | { type: 'edit'; piece: MediaPiece }
  | { type: 'history'; piece: MediaPiece }
  | { type: 'delete'; piece: MediaPiece };

function filtersActive(filters: MediaPieceFilterValues): boolean {
  return Boolean(
    filters.query.trim() ||
      filters.status ||
      filters.type ||
      mediaFilterRange(filters) ||
      filters.personUids.length,
  );
}

export function MediaPieceList({ contentType }: { contentType?: string }) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { pieces, loading, error, createMediaPiece, updateMediaPiece, patchMediaPiece, deleteMediaPiece } =
    useMediaPieces();
  const { types } = useMediaContentTypes();
  const { members } = useMembers();
  const [kpi, setKpi] = useState<MediaKpiId | null>(null);
  const [filters, setFilters] = useState<MediaPieceFilterValues>(EMPTY_MEDIA_FILTERS);
  const [action, setAction] = useState<PieceAction | null>(null);
  const scoped = useMemo(
    () => (contentType ? pieces.filter((piece) => piece.type === contentType) : pieces),
    [contentType, pieces],
  );
  const kpiCounts = useMemo(() => countMediaKpis(scoped), [scoped]);
  const visible = useMemo(() => {
    const kpiRows = scoped.filter((piece) => pieceMatchesKpi(piece, kpi));
    return filterMediaPieces(kpiRows, {
      query: filters.query,
      status: filters.status,
      type: contentType ? '' : filters.type,
      dateRole: filters.dateRole,
      range: mediaFilterRange(filters),
      personRole: filters.personRole,
      personUids: filters.personUids,
      searchText: (row) =>
        pieceSearchText(
          row,
          `${personNames(members, row.editorUids, '')} ${personNames(members, row.reviewerUids, '')} ${personNames(members, row.deployedUids, '')}`,
        ),
    }).sort(compareMediaQueue);
  }, [contentType, filters, kpi, members, scoped]);
  const kind = contentType ? contentTypeBySlug(types, contentType) : undefined;
  const title = kind?.name ?? (contentType ? contentTypeLabel(types, contentType) : mediaCopy.title);
  const description = kind?.hint || (contentType ? '' : mediaCopy.description);
  const sliced = Boolean(kpi) || filtersActive(filters);
  const plot = useMemo<CalendarPlot>(() => {
    const range = mediaFilterRange(filters);
    if (range && (filters.dateRole === 'shoot' || filters.dateRole === 'publish')) {
      return { kinds: [filters.dateRole], range };
    }
    return { kinds: ['shoot', 'publish'], range };
  }, [filters]);

  function onFiltersChange(next: MediaPieceFilterValues) {
    setFilters(next);
  }

  async function onPatch(piece: MediaPiece, patch: Partial<MediaPieceWriteInput>) {
    try {
      await patchMediaPiece(piece.id, patch);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.saveFailed);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {contentType ? (
            <Button type="button" variant="outline" asChild>
              <Link href="/media">
                <ArrowLeft />
                {mediaCopy.backToMedia}
              </Link>
            </Button>
          ) : null}
          <Button type="button" variant="outline" asChild>
            <Link href="/media/types">
              <Settings2 />
              {mediaCopy.manage}
            </Link>
          </Button>
          <Button type="button" onClick={() => setAction({ type: 'create' })}>
            <Plus />
            {mediaCopy.add}
          </Button>
        </div>
      </div>

      <MediaKpiCards counts={kpiCounts} total={scoped.length} selected={kpi} onSelect={setKpi} locale={locale} />

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <div className="flex flex-col gap-4">
          <MediaPieceFilters
            filters={filters}
            types={types}
            members={members}
            hideTypeFilter={Boolean(contentType)}
            onChange={onFiltersChange}
          />
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">{mediaCopy.listTab}</TabsTrigger>
              <TabsTrigger value="board">{mediaCopy.boardTab}</TabsTrigger>
              <TabsTrigger value="calendar">{mediaCopy.calendarTab}</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <MediaPieceTable
                pieces={visible}
                types={types}
                members={members}
                emptyTitle={
                  sliced
                    ? mediaCopy.kpiEmpty
                    : contentType
                      ? withPieceName(mediaCopy.emptyType, title)
                      : mediaCopy.empty
                }
                onView={(piece) => setAction({ type: 'view', piece })}
                onEdit={(piece) => setAction({ type: 'edit', piece })}
                onHistory={(piece) => setAction({ type: 'history', piece })}
                onDelete={(piece) => setAction({ type: 'delete', piece })}
                onPatch={onPatch}
              />
            </TabsContent>
            <TabsContent value="board">
              <MediaPieceBoard
                pieces={visible}
                types={types}
                members={members}
                emptyTitle={
                  sliced
                    ? mediaCopy.kpiEmpty
                    : contentType
                      ? withPieceName(mediaCopy.emptyType, title)
                      : mediaCopy.empty
                }
                onView={(piece) => setAction({ type: 'view', piece })}
                onPatch={onPatch}
              />
            </TabsContent>
            <TabsContent value="calendar">
              <MediaPieceCalendar
                pieces={visible}
                types={types}
                members={members}
                plot={plot}
                emptyTitle={sliced ? mediaCopy.kpiEmpty : undefined}
                emptyTypeName={contentType ? title : undefined}
                onAddDay={(date) => setAction({ type: 'create', date })}
                onView={(piece) => setAction({ type: 'view', piece })}
                onEdit={(piece) => setAction({ type: 'edit', piece })}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : null}

      <MediaPieceViewDialog
        piece={action?.type === 'view' ? action.piece : null}
        types={types}
        members={members}
        open={action?.type === 'view'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onEdit={(piece) => setAction({ type: 'edit', piece })}
        onHistory={(piece) => setAction({ type: 'history', piece })}
      />
      <MediaPieceHistoryDialog
        piece={action?.type === 'history' ? action.piece : null}
        members={members}
        open={action?.type === 'history'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
      />
      <MediaPieceDialog
        piece={action?.type === 'edit' ? action.piece : null}
        types={types}
        lockedType={action?.type === 'create' ? contentType : undefined}
        defaultDate={action?.type === 'create' ? action.date : undefined}
        defaultDateField={action?.type === 'create' && action.date ? 'publish' : undefined}
        open={action?.type === 'create' || action?.type === 'edit'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onCreate={createMediaPiece}
        onUpdate={updateMediaPiece}
      />
      <DeleteMediaPieceDialog
        piece={action?.type === 'delete' ? action.piece : null}
        open={action?.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onDelete={deleteMediaPiece}
      />
    </div>
  );
}

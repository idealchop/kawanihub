/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useLocale } from '@/features/locale';
import type { Member } from '@/features/users/types/member';
import { cn } from '@/lib/utils';
import { formatPieceDate, linkLabel } from '../lib/format-piece-date';
import { formatMediaOpenAge, getMediaCopy, withPieceName } from '../lib/media-copy';
import {
  formatMediaOpenDuration,
  pieceNeedsAttention,
  pieceOpenUntil,
} from '../lib/piece-attention';
import { StatusPill, StatusSwatch } from '../lib/piece-badge';
import {
  BOARD_COLUMNS,
  boardCardId,
  boardColumnId,
  groupPiecesByBoardColumn,
  statusFromBoardDrop,
  type BoardColumn,
} from '../lib/piece-board';
import { personNames } from '../lib/piece-person';
import type { MediaContentType } from '../types/media-content-type';
import { pieceLinks, type MediaPiece, type MediaPieceWriteInput } from '../types/media-piece';
import { ContentTypeChip } from './content-type-chip';

type MediaCopy = ReturnType<typeof getMediaCopy>;
type PiecePatch = Pick<MediaPieceWriteInput, 'status'>;

function detailsWhen(row: MediaPiece, mediaCopy: MediaCopy, locale: string): string {
  const parts: string[] = [];
  if (row.shootDate) parts.push(`${mediaCopy.shoot} ${formatPieceDate(row.shootDate, locale)}`);
  if (row.publishDate) parts.push(`${mediaCopy.publish} ${formatPieceDate(row.publishDate, locale)}`);
  return parts.join(' · ');
}

function BoardPieceFace({
  piece,
  types,
  members,
  mediaCopy,
  locale,
}: {
  piece: MediaPiece;
  types: MediaContentType[];
  members: Member[];
  mediaCopy: MediaCopy;
  locale: string;
}) {
  const when = detailsWhen(piece, mediaCopy, locale);
  const attention = pieceNeedsAttention(piece);
  const open = formatMediaOpenDuration(piece.createdAt, pieceOpenUntil(piece));
  const openLabel = open ? formatMediaOpenAge(mediaCopy, open) : '';
  const editor = personNames(members, piece.editorUids, '');
  const links = pieceLinks(piece);
  return (
    <div className="space-y-2">
      <p className="font-medium leading-tight">{piece.title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusPill status={piece.status} label={mediaCopy.statuses[piece.status]} />
        <ContentTypeChip types={types} slug={piece.type} />
      </div>
      {when ? <p className="text-xs text-muted-foreground">{when}</p> : null}
      {editor ? <p className="text-xs text-muted-foreground">{`${mediaCopy.editorLabel} · ${editor}`}</p> : null}
      {attention || openLabel ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          {attention ? <span className="font-medium text-destructive">{mediaCopy.needsAttention}</span> : null}
          {openLabel ? <span className="text-muted-foreground">{openLabel}</span> : null}
        </p>
      ) : null}
      {links.length > 0 ? (
        <p className="truncate text-xs text-muted-foreground">{links.map((href) => linkLabel(href)).join(' · ')}</p>
      ) : null}
    </div>
  );
}

function BoardPieceCard({
  piece,
  types,
  members,
  mediaCopy,
  locale,
  onView,
}: {
  piece: MediaPiece;
  types: MediaContentType[];
  members: Member[];
  mediaCopy: MediaCopy;
  locale: string;
  onView: (piece: MediaPiece) => void;
}) {
  const skipClick = useRef(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: boardCardId(piece.id),
    data: { status: piece.status },
  });
  useEffect(() => {
    if (isDragging) skipClick.current = true;
  }, [isDragging]);
  return (
    <button
      type="button"
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        'w-full rounded-lg border bg-background p-3 text-left shadow-sm hover:bg-accent/40',
        isDragging && 'opacity-40',
      )}
      aria-label={withPieceName(mediaCopy.boardMove, piece.title)}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (skipClick.current) {
          skipClick.current = false;
          return;
        }
        onView(piece);
      }}
    >
      <BoardPieceFace piece={piece} types={types} members={members} mediaCopy={mediaCopy} locale={locale} />
    </button>
  );
}

function BoardColumn({
  column,
  pieces,
  types,
  members,
  mediaCopy,
  locale,
  onView,
}: {
  column: BoardColumn;
  pieces: MediaPiece[];
  types: MediaContentType[];
  members: Member[];
  mediaCopy: MediaCopy;
  locale: string;
  onView: (piece: MediaPiece) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: boardColumnId(column.id),
    data: { columnId: column.id },
  });
  const title = mediaCopy.boardColumns[column.id];
  const statusNames = column.statuses.map((status) => mediaCopy.statuses[status]).join(' · ');
  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20',
        isOver && 'ring-2 ring-primary/40',
      )}
    >
      <div className="flex items-center justify-between gap-2 rounded-t-xl border-b px-3 py-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold leading-tight">
          <span className="flex shrink-0 gap-0.5" title={statusNames} aria-hidden>
            {column.statuses.map((status) => (
              <StatusSwatch key={status} status={status} />
            ))}
          </span>
          <span className="truncate" title={statusNames}>
            {title}
          </span>
        </span>
        <span className="tabular-nums text-xs text-muted-foreground">{pieces.length}</span>
      </div>
      <div className="flex max-h-[min(70vh,40rem)] min-h-28 flex-col gap-2 overflow-y-auto p-2">
        {pieces.map((piece) => (
          <BoardPieceCard
            key={piece.id}
            piece={piece}
            types={types}
            members={members}
            mediaCopy={mediaCopy}
            locale={locale}
            onView={onView}
          />
        ))}
        {pieces.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">{mediaCopy.boardDrop}</p>
        ) : null}
      </div>
    </section>
  );
}

export function MediaPieceBoard({
  pieces,
  types,
  members,
  emptyTitle,
  onView,
  onPatch,
}: {
  pieces: MediaPiece[];
  types: MediaContentType[];
  members: Member[];
  emptyTitle?: string;
  onView: (piece: MediaPiece) => void;
  onPatch: (piece: MediaPiece, patch: PiecePatch) => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const [activeId, setActiveId] = useState<string | null>(null);
  const grouped = useMemo(() => groupPiecesByBoardColumn(pieces), [pieces]);
  const activePiece = pieces.find((row) => boardCardId(row.id) === activeId) ?? null;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const piece = pieces.find((row) => boardCardId(row.id) === String(event.active.id));
    if (!piece || !event.over) return;
    const next = statusFromBoardDrop(piece, event.over.id, event.over.data.current, pieces);
    if (!next || next === piece.status) return;
    onPatch(piece, { status: next });
  }

  return (
    <div className="flex flex-col gap-3">
      {pieces.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyTitle ?? mediaCopy.empty}</p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {BOARD_COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              pieces={grouped[column.id]}
              types={types}
              members={members}
              mediaCopy={mediaCopy}
              locale={locale}
              onView={onView}
            />
          ))}
        </div>
        <DragOverlay>
          {activePiece ? (
            <div className="w-64 rounded-lg border bg-background p-3 shadow-md">
              <BoardPieceFace
                piece={activePiece}
                types={types}
                members={members}
                mediaCopy={mediaCopy}
                locale={locale}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { isMediaStatus, type MediaPiece, type MediaStatus } from '../types/media-piece';

export const BOARD_COLUMNS = [
  { id: 'edit', statuses: ['not_started', 'editing', 'revision', 'caption'], dropStatus: 'editing' },
  { id: 'review', statuses: ['ready_for_review', 'under_review'], dropStatus: 'ready_for_review' },
  { id: 'post', statuses: ['ready_for_publish', 'scheduled_post'], dropStatus: 'ready_for_publish' },
  { id: 'closed', statuses: ['published', 'not_published'], dropStatus: 'published' },
] as const;

export type BoardColumnId = (typeof BOARD_COLUMNS)[number]['id'];
export type BoardColumn = (typeof BOARD_COLUMNS)[number];

export function boardColumnById(id: string): BoardColumn | undefined {
  return BOARD_COLUMNS.find((column) => column.id === id);
}

export function boardColumnId(columnId: BoardColumnId): string {
  return `column:${columnId}`;
}

export function boardCardId(pieceId: string): string {
  return `piece:${pieceId}`;
}

export function groupPiecesByBoardColumn(pieces: MediaPiece[]): Record<BoardColumnId, MediaPiece[]> {
  const grouped = Object.fromEntries(BOARD_COLUMNS.map((column) => [column.id, [] as MediaPiece[]])) as Record<
    BoardColumnId,
    MediaPiece[]
  >;
  for (const piece of pieces) {
    const column = BOARD_COLUMNS.find((row) => row.statuses.includes(piece.status));
    if (column) grouped[column.id].push(piece);
  }
  return grouped;
}

export function dropStatusForColumn(piece: MediaPiece, columnId: string): MediaStatus | null {
  const column = boardColumnById(columnId);
  if (!column) return null;
  if ((column.statuses as readonly MediaStatus[]).includes(piece.status)) return piece.status;
  return column.dropStatus;
}

export function statusFromBoardDrop(
  piece: MediaPiece,
  overId: string | number,
  overData: { columnId?: unknown; status?: unknown } | undefined,
  pieces: MediaPiece[],
): MediaStatus | null {
  const id = String(overId);
  if (id.startsWith('piece:')) {
    if (typeof overData?.status === 'string' && isMediaStatus(overData.status)) return overData.status;
    const pieceId = id.slice('piece:'.length);
    return pieces.find((row) => row.id === pieceId)?.status ?? null;
  }
  const columnId =
    typeof overData?.columnId === 'string' ? overData.columnId : id.startsWith('column:') ? id.slice('column:'.length) : '';
  return dropStatusForColumn(piece, columnId);
}

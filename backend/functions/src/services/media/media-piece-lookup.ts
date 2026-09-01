/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { memoryDb } from '../../store/memory-store';
import type { MediaPieceRecord } from './media-types';

export function pieceKey(workspaceId: string, pieceId: string): string {
  return `${workspaceId}:${pieceId}`;
}

export function findDemoMediaPiece(workspaceId: string, pieceId: string): MediaPieceRecord | undefined {
  if (!pieceId) return undefined;
  const keyed = workspaceId ? memoryDb.mediaPieces.get(pieceKey(workspaceId, pieceId)) : undefined;
  if (keyed) return keyed;
  return [...memoryDb.mediaPieces.values()].find(
    (row) => row.id === pieceId && (!workspaceId || row.workspaceId === workspaceId),
  );
}

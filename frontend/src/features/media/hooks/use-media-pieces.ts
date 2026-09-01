/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getMediaCopy } from '../lib/media-copy';
import { createMediaPiece, deleteMediaPiece, listMediaPieces, updateMediaPiece } from '../services/media-api';
import { normalizeMediaPiece, toMediaPieceWriteInput, type MediaPiece, type MediaPieceWriteInput } from '../types/media-piece';

export function useMediaPieces() {
  const [pieces, setPieces] = useState<MediaPiece[]>([]);
  const piecesRef = useRef<MediaPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const listed = await listMediaPieces();
      piecesRef.current = listed;
      setPieces(listed);
    } catch (err) {
      setError(err instanceof Error ? err.message : getMediaCopy().loadError);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    const unsubscribe = liveSync.subscribe(() => {
      void refresh(true);
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  const patchMediaPiece = useCallback(async (pieceId: string, patch: Partial<MediaPieceWriteInput>) => {
    const current = piecesRef.current.find((row) => row.id === pieceId);
    if (!current) return;
    const input = { ...toMediaPieceWriteInput(current), ...patch };
    const optimistic = normalizeMediaPiece({ ...current, ...input, id: pieceId });
    piecesRef.current = piecesRef.current.map((row) => (row.id === pieceId ? optimistic : row));
    setPieces(piecesRef.current);
    try {
      const saved = normalizeMediaPiece(await updateMediaPiece(pieceId, input));
      piecesRef.current = piecesRef.current.map((row) => (row.id === pieceId ? saved : row));
      setPieces(piecesRef.current);
      return saved;
    } catch (err) {
      await refresh();
      throw err;
    }
  }, [refresh]);

  return { pieces, loading, error, refresh, createMediaPiece, updateMediaPiece, patchMediaPiece, deleteMediaPiece };
}

export type { MediaPieceWriteInput };

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getMediaCopy } from '../lib/media-copy';
import {
  createMediaComment,
  listMediaComments,
  toggleMediaCommentReaction,
} from '../services/media-activity-api';
import type { MediaComment, MediaReactionEmoji } from '../types/media-comment';
import { MEDIA_COMMENT_PAGE_SIZE } from '../types/media-comment';

export function useMediaComments(pieceId: string | null) {
  const [comments, setComments] = useState<MediaComment[]>([]);
  const [paging, setPaging] = useState({ id: pieceId, page: 1 });
  const page = paging.id === pieceId ? paging.page : 1;
  const setPage = useCallback((next: number) => setPaging({ id: pieceId, page: next }), [pieceId]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(MEDIA_COMMENT_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (silent = false, nextPage = page) => {
      if (!pieceId) {
        setComments([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      setError(null);
      try {
        const listed = await listMediaComments(pieceId, nextPage);
        setComments(listed.comments);
        setTotal(listed.total);
        setPageSize(listed.pageSize);
      } catch (err) {
        setError(err instanceof Error ? err.message : getMediaCopy().loadError);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, pieceId],
  );

  useEffect(() => {
    if (!pieceId) return;
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
  }, [pieceId, refresh]);

  const addComment = useCallback(
    async (body: string) => {
      if (!pieceId) return;
      await createMediaComment(pieceId, body);
      setPage(1);
      await refresh(true, 1);
    },
    [pieceId, refresh, setPage],
  );

  const reactToComment = useCallback(
    async (commentId: string, emoji: MediaReactionEmoji) => {
      if (!pieceId) return;
      const saved = await toggleMediaCommentReaction(pieceId, commentId, emoji);
      setComments((current) => current.map((row) => (row.id === commentId ? saved : row)));
    },
    [pieceId],
  );

  return {
    comments,
    page,
    pageSize,
    total,
    loading,
    error,
    setPage,
    addComment,
    reactToComment,
  };
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export const MEDIA_PIECE_EVENT_TYPES = [
  'created',
  'updated',
  'status',
  'assigned',
  'comment',
  'reaction',
  'deleted',
] as const;
export type MediaPieceEventType = (typeof MEDIA_PIECE_EVENT_TYPES)[number];

export type MediaPeopleRole = 'editor' | 'reviewer' | 'deployed';

export type MediaPieceEventPayload = {
  statusFrom?: string;
  statusTo?: string;
  role?: MediaPeopleRole;
  addedUids?: string[];
  removedUids?: string[];
  commentId?: string;
  commentPreview?: string;
  emoji?: string;
  title?: string;
};

export type MediaPieceEvent = {
  id: string;
  workspaceId: string;
  pieceId: string;
  type: MediaPieceEventType;
  actorUid: string;
  actorName: string;
  createdAt: string;
  payload: MediaPieceEventPayload;
};

export type MediaHistoryListResponse = {
  events: MediaPieceEvent[];
  page: number;
  pageSize: number;
  total: number;
};

export const MEDIA_HISTORY_PAGE_SIZE = 10;
export const MEDIA_RECENT_PAGE_SIZE = 20;

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export const MEDIA_REACTION_EMOJIS = ['👍', '❤️', '😂', '👀'] as const;
export type MediaReactionEmoji = (typeof MEDIA_REACTION_EMOJIS)[number];

export function isMediaReactionEmoji(value: string): value is MediaReactionEmoji {
  return (MEDIA_REACTION_EMOJIS as readonly string[]).includes(value);
}

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

export type MediaCommentRecord = {
  id: string;
  workspaceId: string;
  pieceId: string;
  body: string;
  authorUid: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  reactions: Record<string, string[]>;
};

export type MediaPieceEventRecord = {
  id: string;
  workspaceId: string;
  pieceId: string;
  type: MediaPieceEventType;
  actorUid: string;
  actorName: string;
  createdAt: string;
  payload: MediaPieceEventPayload;
};

export type MediaActivityPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export const MEDIA_COMMENT_PAGE_SIZE = 5;
export const MEDIA_HISTORY_PAGE_SIZE = 10;
export const MEDIA_RECENT_PAGE_SIZE = 20;
export const MEDIA_COMMENT_PREVIEW_LENGTH = 80;

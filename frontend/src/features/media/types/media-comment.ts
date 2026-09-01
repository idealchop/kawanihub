/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export const MEDIA_REACTION_EMOJIS = ['👍', '❤️', '😂', '👀'] as const;
export type MediaReactionEmoji = (typeof MEDIA_REACTION_EMOJIS)[number];

export type MediaComment = {
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

export type MediaCommentListResponse = {
  comments: MediaComment[];
  page: number;
  pageSize: number;
  total: number;
};

export const MEDIA_COMMENT_PAGE_SIZE = 5;

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';
import {
  MEDIA_COMMENT_PAGE_SIZE,
  MEDIA_HISTORY_PAGE_SIZE,
  MEDIA_RECENT_PAGE_SIZE,
  MEDIA_REACTION_EMOJIS,
} from './media-activity-types';

export const mediaCommentWriteSchema = z.object({
  body: z.string().trim().min(1).max(800),
});

export const mediaReactionWriteSchema = z.object({
  emoji: z.enum(MEDIA_REACTION_EMOJIS),
});

function pageQuery(defaultSize: number) {
  return z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(50).optional().default(defaultSize),
  });
}

export const mediaCommentPageQuerySchema = pageQuery(MEDIA_COMMENT_PAGE_SIZE);
export const mediaHistoryPageQuerySchema = pageQuery(MEDIA_HISTORY_PAGE_SIZE);
export const mediaRecentPageQuerySchema = pageQuery(MEDIA_RECENT_PAGE_SIZE);

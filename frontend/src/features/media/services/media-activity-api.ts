/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { MediaComment, MediaCommentListResponse, MediaReactionEmoji } from '../types/media-comment';
import { MEDIA_COMMENT_PAGE_SIZE } from '../types/media-comment';
import type { MediaHistoryListResponse, MediaPieceEvent } from '../types/media-history';
import { MEDIA_HISTORY_PAGE_SIZE, MEDIA_RECENT_PAGE_SIZE } from '../types/media-history';

const pieceBase = (pieceId: string) => `/workspaces/${appConfig.defaultWorkspaceId}/media/${pieceId}`;

export async function listMediaComments(
  pieceId: string,
  page = 1,
  pageSize = MEDIA_COMMENT_PAGE_SIZE,
): Promise<MediaCommentListResponse> {
  return apiClient.get<MediaCommentListResponse>(
    `${pieceBase(pieceId)}/comments?page=${page}&pageSize=${pageSize}`,
  );
}

export async function getMediaComment(pieceId: string, commentId: string): Promise<MediaComment> {
  return apiClient.get<MediaComment>(`${pieceBase(pieceId)}/comments/${commentId}`);
}

export async function createMediaComment(pieceId: string, body: string): Promise<MediaComment> {
  return apiClient.post<MediaComment>(`${pieceBase(pieceId)}/comments`, { body });
}

export async function toggleMediaCommentReaction(
  pieceId: string,
  commentId: string,
  emoji: MediaReactionEmoji,
): Promise<MediaComment> {
  return apiClient.post<MediaComment>(`${pieceBase(pieceId)}/comments/${commentId}/reactions`, { emoji });
}

export async function listMediaHistory(
  pieceId: string,
  page = 1,
  pageSize = MEDIA_HISTORY_PAGE_SIZE,
): Promise<MediaHistoryListResponse> {
  return apiClient.get<MediaHistoryListResponse>(
    `${pieceBase(pieceId)}/events?page=${page}&pageSize=${pageSize}`,
  );
}

export async function listRecentMediaEvents(
  page = 1,
  pageSize = MEDIA_RECENT_PAGE_SIZE,
): Promise<MediaHistoryListResponse> {
  return apiClient.get<MediaHistoryListResponse>(
    `/workspaces/${appConfig.defaultWorkspaceId}/media/events?page=${page}&pageSize=${pageSize}`,
  );
}

export async function getMediaHistoryEvent(pieceId: string, eventId: string): Promise<MediaPieceEvent> {
  return apiClient.get<MediaPieceEvent>(`${pieceBase(pieceId)}/events/${eventId}`);
}

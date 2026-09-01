/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { MediaPiece, MediaPieceListResponse, MediaPieceWriteInput } from '../types/media-piece';
import { normalizeMediaPiece } from '../types/media-piece';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/media`;

export async function listMediaPieces(): Promise<MediaPiece[]> {
  const data = await apiClient.get<MediaPieceListResponse>(base());
  return data.pieces.map((piece) => normalizeMediaPiece(piece));
}

export async function createMediaPiece(input: MediaPieceWriteInput): Promise<MediaPiece> {
  return apiClient.post<MediaPiece>(base(), input);
}

export async function updateMediaPiece(pieceId: string, input: MediaPieceWriteInput): Promise<MediaPiece> {
  return apiClient.put<MediaPiece>(`${base()}/${pieceId}`, input);
}

export async function deleteMediaPiece(pieceId: string): Promise<void> {
  await apiClient.delete(`${base()}/${pieceId}`);
}

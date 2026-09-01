/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type {
  MediaContentType,
  MediaContentTypeListResponse,
  MediaContentTypeWriteInput,
} from '../types/media-content-type';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/media-types`;

export async function listMediaContentTypes(): Promise<MediaContentType[]> {
  const data = await apiClient.get<MediaContentTypeListResponse>(base());
  return data.types;
}

export async function createMediaContentType(input: MediaContentTypeWriteInput): Promise<MediaContentType> {
  return apiClient.post<MediaContentType>(base(), input);
}

export async function updateMediaContentType(
  typeId: string,
  input: MediaContentTypeWriteInput,
): Promise<MediaContentType> {
  return apiClient.put<MediaContentType>(`${base()}/${typeId}`, input);
}

export async function deleteMediaContentType(typeId: string): Promise<void> {
  await apiClient.delete(`${base()}/${typeId}`);
}

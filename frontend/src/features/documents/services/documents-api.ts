/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { DeskDocument, DocumentListResponse, DocumentWriteInput } from '../types/document';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/documents`;

export async function listDocuments(): Promise<DeskDocument[]> {
  const data = await apiClient.get<DocumentListResponse>(base());
  return data.documents;
}

export async function createDocument(input: DocumentWriteInput): Promise<DeskDocument> {
  return apiClient.post<DeskDocument>(base(), input);
}

export async function updateDocument(documentId: string, input: DocumentWriteInput): Promise<DeskDocument> {
  return apiClient.put<DeskDocument>(`${base()}/${documentId}`, input);
}

export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete(`${base()}/${documentId}`);
}

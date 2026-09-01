/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { Item, ItemListResponse, ItemWriteInput } from '../types/item';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/items`;

export async function listItems(): Promise<Item[]> {
  const data = await apiClient.get<ItemListResponse>(base());
  return data.items;
}

export async function createItem(input: ItemWriteInput): Promise<Item> {
  return apiClient.post<Item>(base(), input);
}

export async function updateItem(itemId: string, input: ItemWriteInput): Promise<Item> {
  return apiClient.put<Item>(`${base()}/${itemId}`, input);
}

export async function deleteItem(itemId: string): Promise<void> {
  await apiClient.delete(`${base()}/${itemId}`);
}

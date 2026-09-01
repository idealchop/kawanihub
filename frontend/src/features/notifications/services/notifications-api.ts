/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { DeskNotification, NotificationListResponse, NotificationWriteInput } from '../types/notification';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/notifications`;

export async function listNotifications(): Promise<DeskNotification[]> {
  const data = await apiClient.get<NotificationListResponse>(base());
  return data.notifications;
}

export async function createNotification(input: NotificationWriteInput): Promise<DeskNotification> {
  return apiClient.post<DeskNotification>(base(), input);
}

export async function updateNotification(
  notificationId: string,
  input: NotificationWriteInput | { read: boolean },
): Promise<DeskNotification> {
  return apiClient.put<DeskNotification>(`${base()}/${notificationId}`, input);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`${base()}/${notificationId}`);
}

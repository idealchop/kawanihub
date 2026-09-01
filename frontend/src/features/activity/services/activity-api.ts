/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { ActivityListResponse, ActivityLog } from '../types/activity';

export async function listActivity(): Promise<ActivityLog[]> {
  const data = await apiClient.get<ActivityListResponse>(
    `/workspaces/${appConfig.defaultWorkspaceId}/activity`,
  );
  return data.logs;
}

export async function getActivity(logId: string): Promise<ActivityLog> {
  return apiClient.get<ActivityLog>(`/workspaces/${appConfig.defaultWorkspaceId}/activity/${logId}`);
}

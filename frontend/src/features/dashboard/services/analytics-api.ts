/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { AnalyticsSnapshot } from '../types/analytics';

export async function getAnalytics(): Promise<AnalyticsSnapshot> {
  return apiClient.get<AnalyticsSnapshot>(`/workspaces/${appConfig.defaultWorkspaceId}/analytics`);
}

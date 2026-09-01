/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { DeskEvent, EventListResponse, EventWriteInput } from '../types/event';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/events`;

export async function listEvents(): Promise<DeskEvent[]> {
  const data = await apiClient.get<EventListResponse>(base());
  return data.events;
}

export async function createEvent(input: EventWriteInput): Promise<DeskEvent> {
  return apiClient.post<DeskEvent>(base(), input);
}

export async function updateEvent(eventId: string, input: EventWriteInput): Promise<DeskEvent> {
  return apiClient.put<DeskEvent>(`${base()}/${eventId}`, input);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await apiClient.delete(`${base()}/${eventId}`);
}

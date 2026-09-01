/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { brand } from '@/config/brand';
import { liveSync } from '@/lib/live-sync';
import { memoryStore } from '@/lib/memory-store';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (appConfig.demoMode) {
    const email = memoryStore.get<string>('demo.email') ?? 'admin@kawanihub.ph';
    return {
      Authorization: 'Bearer DEMO_TOKEN',
      'X-Demo-Email': email,
    };
  }

  const { getFirebaseAuth } = await import('@/lib/firebase/auth');
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Product-Name': brand.productSlug,
    'X-Workspace-Id': appConfig.defaultWorkspaceId,
    ...(await getAuthHeaders()),
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Network error. Is the API running on port 8080?');
  }

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & { message?: string }) : ({} as T);

  if (!response.ok) {
    throw new ApiError(response.status, (data as { message?: string }).message ?? response.statusText);
  }

  if (method !== 'GET') liveSync.publish();
  return data;
}

export const apiClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

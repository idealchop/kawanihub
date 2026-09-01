/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { brand } from '@/config/brand';
import { ApiError } from '@/lib/api-client';
import type { PublicSolicitation, SolicitationClaimInput, SolicitationWriteInput } from '../types/solicitation';

const base = () => `/public/workspaces/${appConfig.defaultWorkspaceId}/solicitations`;

async function publicRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Product-Name': brand.productSlug,
    'X-Workspace-Id': appConfig.defaultWorkspaceId,
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
  return data;
}

export async function createPublicSolicitation(input: SolicitationWriteInput): Promise<PublicSolicitation> {
  return publicRequest<PublicSolicitation>('POST', base(), input);
}

export async function getPublicSolicitation(solicitationId: string): Promise<PublicSolicitation> {
  return publicRequest<PublicSolicitation>('GET', `${base()}/${solicitationId}`);
}

export async function submitPublicRequirements(
  solicitationId: string,
  requirements: { id: string; photo: string; photoName?: string }[],
): Promise<PublicSolicitation> {
  return publicRequest<PublicSolicitation>('POST', `${base()}/${solicitationId}/requirements`, { requirements });
}

export async function claimPublicSolicitation(input: SolicitationClaimInput): Promise<PublicSolicitation> {
  return publicRequest<PublicSolicitation>('POST', `${base()}/claim`, input);
}

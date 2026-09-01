/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type {
  DueDiligenceResponse,
  Solicitation,
  SolicitationClaimInput,
  SolicitationListResponse,
  SolicitationWriteInput,
} from '../types/solicitation';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/solicitations`;

export async function listSolicitations(): Promise<SolicitationListResponse> {
  return apiClient.get<SolicitationListResponse>(base());
}

export async function createSolicitation(input: SolicitationWriteInput): Promise<Solicitation> {
  return apiClient.post<Solicitation>(base(), input);
}

export async function updateSolicitation(solicitationId: string, input: SolicitationWriteInput): Promise<Solicitation> {
  return apiClient.put<Solicitation>(`${base()}/${solicitationId}`, input);
}

export async function reviewSolicitation(solicitationId: string): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/review`);
}

export async function approveSolicitation(solicitationId: string, override = false): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/approve`, { override });
}

export async function markReadyToClaim(solicitationId: string): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/ready-to-claim`);
}

export async function rejectSolicitation(solicitationId: string, reason: string): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/reject`, { reason });
}

export async function assignSolicitation(
  solicitationId: string,
  input: { reviewerUid?: string; accountantUid?: string },
): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/assign`, input);
}

export async function requestMissingRequirements(
  solicitationId: string,
  input: { note: string; extraLabel?: string },
): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/missing`, input);
}

export async function escalateSolicitation(solicitationId: string, note: string): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/escalate`, { note });
}

export async function expediteSolicitation(solicitationId: string): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/expedite`);
}

export async function flagSolicitation(
  solicitationId: string,
  input: { type: 'suspicious_request' | 'suspicious_requester' | 'suspicious_beneficiary'; message: string },
): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/${solicitationId}/flag`, input);
}

export async function getDueDiligence(solicitationId: string): Promise<DueDiligenceResponse> {
  return apiClient.get<DueDiligenceResponse>(`${base()}/${solicitationId}/due-diligence`);
}

export async function listPersonHistory(query: { name?: string; idNumber?: string; barangay?: string }): Promise<Solicitation[]> {
  const params = new URLSearchParams();
  if (query.name) params.set('name', query.name);
  if (query.idNumber) params.set('idNumber', query.idNumber);
  if (query.barangay) params.set('barangay', query.barangay);
  const data = await apiClient.get<SolicitationListResponse>(`${base()}/history?${params.toString()}`);
  return data.solicitations;
}

export type SolicitationReportFormat = 'csv' | 'xlsx' | 'pdf';

export async function downloadSolicitationReport(format: SolicitationReportFormat = 'csv'): Promise<void> {
  const data = await apiClient.get<{ filename: string; mime: string; body: string }>(
    `${base()}/report?format=${format}`,
  );
  const binary = Uint8Array.from(atob(data.body), (char) => char.charCodeAt(0));
  const blob = new Blob([binary], { type: data.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = data.filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function claimSolicitation(input: SolicitationClaimInput): Promise<Solicitation> {
  return apiClient.post<Solicitation>(`${base()}/claim`, input);
}

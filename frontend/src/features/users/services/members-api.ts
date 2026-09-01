/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { apiClient } from '@/lib/api-client';
import type { CreateMemberResponse, Member, MemberListResponse, MemberWriteInput } from '../types/member';

const base = () => `/workspaces/${appConfig.defaultWorkspaceId}/members`;

export async function listMembers(): Promise<Member[]> {
  const data = await apiClient.get<MemberListResponse>(base());
  return data.members;
}

export async function getCurrentMember(): Promise<Member> {
  return apiClient.get<Member>(`${base()}/me`);
}

export async function createMember(input: MemberWriteInput): Promise<CreateMemberResponse> {
  return apiClient.post<CreateMemberResponse>(base(), input);
}

export async function updateMember(memberId: string, input: MemberWriteInput): Promise<Member> {
  return apiClient.put<Member>(`${base()}/${memberId}`, input);
}

export async function deleteMember(memberId: string): Promise<void> {
  await apiClient.delete(`${base()}/${memberId}`);
}

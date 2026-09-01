/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { AppModule } from '@/features/dashboard/lib/nav-items';

export type MemberRole = 'owner' | 'admin' | 'assistant' | 'member';
export const ASSIGNABLE_MEMBER_ROLES = ['admin', 'assistant', 'member'] as const satisfies readonly MemberRole[];
export type MemberStatus = 'active' | 'invited' | 'disabled';

export type MediaAccess = 'admin' | 'member' | 'none';
export type SolicitationAccess = 'admin' | 'accountant' | 'reviewer' | 'none';
export type AssistantAccess = 'admin' | 'assistant' | 'none';
export type LegislativeAccess = 'admin' | 'member' | 'none';

export type MemberAccess = {
  media: MediaAccess;
  solicitation: SolicitationAccess;
  assistant: AssistantAccess;
  legislative: LegislativeAccess;
};

export type Member = {
  id: string;
  uid: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  displayName: string;
  role: MemberRole;
  access: MemberAccess;
  solicitRole?: 'admin' | 'reviewer' | 'accountant';
  permissions: AppModule[];
  status: MemberStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MemberListResponse = {
  members: Member[];
};

export type MemberWriteInput = {
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  displayName?: string;
  role?: MemberRole;
  access?: MemberAccess;
  status?: MemberStatus;
  uid?: string;
  password?: string;
};

export type CreateMemberResponse = {
  member: Member;
  temporaryPassword?: string;
};

export { memberCanAccess } from '../lib/member-access';

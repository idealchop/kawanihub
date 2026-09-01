/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import {
  defaultAccessForRole,
  EMPTY_ACCESS,
  FULL_ADMIN_ACCESS,
  normalizeAccess,
  permissionsFromAccess,
  solicitRoleFromAccess,
  type AssistantAccess,
  type LegislativeAccess,
  type MediaAccess,
  type MemberAccess,
  type SolicitationAccess,
} from './members-access';

export type {
  AssistantAccess,
  LegislativeAccess,
  MediaAccess,
  MemberAccess,
  SolicitationAccess,
};

export const APP_MODULES = [
  'dashboard',
  'solicitation',
  'media',
  'legislative',
  'assistant',
  'users',
  'notifications',
  'calendar',
  'documents',
  'activity',
] as const;

export type AppModule = (typeof APP_MODULES)[number];
export type MemberRole = 'owner' | 'admin' | 'assistant' | 'member';
export type MemberStatus = 'active' | 'invited' | 'disabled';
export const SOLICIT_ROLES = ['admin', 'reviewer', 'accountant'] as const;
export type SolicitRole = (typeof SOLICIT_ROLES)[number];
export const ASSIGNABLE_MEMBER_ROLES = ['admin', 'assistant', 'member'] as const satisfies readonly MemberRole[];

export type MemberRecord = {
  id: string;
  workspaceId: string;
  uid: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  displayName: string;
  role: MemberRole;
  access: MemberAccess;
  solicitRole: SolicitRole;
  permissions: AppModule[];
  status: MemberStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export const ALL_MODULES: AppModule[] = [...APP_MODULES];

export const DEFAULT_ROLE_PERMISSIONS: Record<MemberRole, AppModule[]> = {
  owner: permissionsFromAccess(FULL_ADMIN_ACCESS, 'owner'),
  admin: permissionsFromAccess(EMPTY_ACCESS, 'admin'),
  assistant: permissionsFromAccess(EMPTY_ACCESS, 'assistant'),
  member: permissionsFromAccess(EMPTY_ACCESS, 'member'),
};

export function defaultSolicitRole(role: MemberRole, access?: MemberAccess): SolicitRole {
  return solicitRoleFromAccess(access ?? defaultAccessForRole(role));
}

export function normalizeMemberRecord(record: Partial<MemberRecord> & Pick<MemberRecord, 'id' | 'workspaceId' | 'uid'>): MemberRecord {
  const role = normalizeMemberRole(record.role);
  const access = normalizeAccess(record.access, role);
  const firstName = record.firstName?.trim() || record.displayName?.split(' ')[0] || '';
  const lastName = record.lastName?.trim() || record.displayName?.split(' ').slice(1).join(' ') || '';
  const displayName = record.displayName?.trim() || `${firstName} ${lastName}`.trim() || record.username || 'User';
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    uid: record.uid,
    username: record.username?.trim() || record.email?.split('@')[0] || record.uid,
    firstName,
    lastName,
    phone: record.phone?.trim() || '',
    email: record.email?.trim() || '',
    displayName,
    role,
    access,
    solicitRole: record.solicitRole ?? defaultSolicitRole(role, access),
    permissions: record.permissions?.length ? record.permissions : permissionsFromAccess(access, role),
    status: record.status ?? 'active',
    createdBy: record.createdBy ?? record.uid,
    createdAt: record.createdAt ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? new Date().toISOString(),
  };
}

function normalizeMemberRole(role: MemberRole | 'staff' | 'viewer' | undefined): MemberRole {
  if (role === 'owner' || role === 'admin' || role === 'assistant' || role === 'member') return role;
  if (role === 'staff' || role === 'viewer') return 'member';
  return 'member';
}

export { defaultAccessForRole, FULL_ADMIN_ACCESS, EMPTY_ACCESS, normalizeAccess, permissionsFromAccess };

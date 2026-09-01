/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { AppModule, MemberRecord, MemberRole } from './members-types';

export const MANAGEMENT_DOMAINS = ['solicitation', 'media', 'assistant', 'legislative'] as const;
export type ManagementDomain = (typeof MANAGEMENT_DOMAINS)[number];

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

export const FULL_ADMIN_ACCESS: MemberAccess = {
  media: 'admin',
  solicitation: 'admin',
  assistant: 'admin',
  legislative: 'admin',
};

export const EMPTY_ACCESS: MemberAccess = {
  media: 'none',
  solicitation: 'none',
  assistant: 'none',
  legislative: 'none',
};

const DESK_MODULES: AppModule[] = [
  'dashboard',
  'solicitation',
  'media',
  'legislative',
  'assistant',
  'users',
  'notifications',
  'activity',
];

export function isFullAdminAccess(access: MemberAccess): boolean {
  return (
    access.media === 'admin' &&
    access.solicitation === 'admin' &&
    access.assistant === 'admin' &&
    access.legislative === 'admin'
  );
}

export function isOverallAdmin(member: Pick<MemberRecord, 'role' | 'access'> | undefined): boolean {
  if (!member) return false;
  return member.role === 'owner' || (member.role === 'admin' && isFullAdminAccess(member.access));
}

export function managedDomains(member: Pick<MemberRecord, 'role' | 'access'>): ManagementDomain[] {
  if (member.role === 'owner' || isFullAdminAccess(member.access)) return [...MANAGEMENT_DOMAINS];
  return MANAGEMENT_DOMAINS.filter((domain) => member.access[domain] === 'admin');
}

export function defaultAccessForRole(role: MemberRole): MemberAccess {
  if (role === 'owner') return { ...FULL_ADMIN_ACCESS };
  return { ...EMPTY_ACCESS };
}

export function solicitRoleFromAccess(access: MemberAccess): 'admin' | 'reviewer' | 'accountant' {
  if (access.solicitation === 'admin') return 'admin';
  if (access.solicitation === 'accountant') return 'accountant';
  if (access.solicitation === 'reviewer') return 'reviewer';
  return 'reviewer';
}

export function dashboardTabsForAccess(role: MemberRole, access: MemberAccess): ManagementDomain[] {
  if (role === 'owner') return [...MANAGEMENT_DOMAINS];
  return MANAGEMENT_DOMAINS.filter((domain) => access[domain] === 'admin');
}

export function permissionsFromAccess(access: MemberAccess, role: MemberRole): AppModule[] {
  if (role === 'owner') return [...DESK_MODULES];
  const modules = new Set<AppModule>();
  if (dashboardTabsForAccess(role, access).length > 0) modules.add('dashboard');
  if (access.solicitation !== 'none') modules.add('solicitation');
  if (access.media !== 'none') modules.add('media');
  if (access.assistant !== 'none') modules.add('assistant');
  if (access.legislative !== 'none') modules.add('legislative');
  if (role === 'admin') modules.add('users');
  if (dashboardTabsForAccess(role, access).length > 0) {
    modules.add('notifications');
    modules.add('activity');
  }
  return [...modules];
}

export function normalizeAccess(
  input: Partial<MemberAccess> | undefined,
  role: MemberRole,
): MemberAccess {
  if (role === 'owner') return { ...FULL_ADMIN_ACCESS };
  return {
    media: input?.media ?? 'none',
    solicitation: input?.solicitation ?? 'none',
    assistant: input?.assistant ?? 'none',
    legislative: input?.legislative ?? 'none',
  };
}

export function moduleAccessGranted(role: MemberRole, access: MemberAccess, module: AppModule): boolean {
  if (role === 'owner') return true;
  if (module === 'dashboard') return dashboardTabsForAccess(role, access).length > 0;
  if (module === 'users') return role === 'admin';
  if (module === 'notifications' || module === 'activity') {
    return dashboardTabsForAccess(role, access).length > 0;
  }
  if (module === 'solicitation') return access.solicitation !== 'none';
  if (module === 'media') return access.media !== 'none';
  if (module === 'assistant') return access.assistant !== 'none';
  if (module === 'legislative') return access.legislative !== 'none';
  return false;
}

export function memberHasAccessInDomain(
  member: Pick<MemberRecord, 'access'>,
  domain: ManagementDomain,
): boolean {
  return member.access[domain] !== 'none';
}

export function memberManagedByActor(
  actor: Pick<MemberRecord, 'role' | 'access'>,
  target: Pick<MemberRecord, 'role' | 'access'>,
): boolean {
  if (target.role === 'owner') return false;
  if (isOverallAdmin(actor)) return true;
  if (actor.role !== 'admin') return false;
  const domains = managedDomains(actor);
  if (domains.length === 0) return false;
  return domains.some((domain) => memberHasAccessInDomain(target, domain));
}

export function filterMembersForActor(
  actor: MemberRecord | undefined,
  members: MemberRecord[],
): MemberRecord[] {
  if (!actor || isOverallAdmin(actor)) return members;
  if (actor.role !== 'admin') return [];
  return members.filter((row) => memberManagedByActor(actor, row));
}

export function assertAccessAssignable(
  actor: MemberRecord | undefined,
  access: MemberAccess,
): void {
  if (!actor || isOverallAdmin(actor)) return;
  if (actor.role !== 'admin') {
    throw new Error('You do not have access to manage users');
  }
  const domains = managedDomains(actor);
  for (const domain of MANAGEMENT_DOMAINS) {
    if (access[domain] === 'none') continue;
    if (!domains.includes(domain)) {
      throw new Error(`You cannot assign ${domain} access`);
    }
  }
}

export function generateMemberPassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let value = '';
  for (let index = 0; index < length; index += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

export function memberDisplayName(firstName: string, lastName: string, fallback = ''): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || fallback;
}

export function domainAccessLabel(access: MemberAccess): string {
  const parts: string[] = [];
  if (access.solicitation === 'admin') parts.push('Solicitation admin');
  else if (access.solicitation !== 'none') parts.push(`Solicitation ${access.solicitation}`);
  if (access.media === 'admin') parts.push('Media admin');
  else if (access.media !== 'none') parts.push(`Media ${access.media}`);
  if (access.assistant === 'admin') parts.push('Assistant admin');
  else if (access.assistant !== 'none') parts.push(`Assistant ${access.assistant}`);
  if (access.legislative === 'admin') parts.push('Legislative admin');
  else if (access.legislative !== 'none') parts.push(`Legislative ${access.legislative}`);
  return parts.join(' · ') || 'No domain access';
}

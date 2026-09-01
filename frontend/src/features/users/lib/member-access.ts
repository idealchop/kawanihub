/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { AppModule } from '@/features/dashboard/lib/nav-items';
import type { Member, MemberAccess, MemberRole } from '../types/member';

export const MANAGEMENT_DOMAINS = ['solicitation', 'media', 'assistant', 'legislative'] as const;
export type ManagementDomain = (typeof MANAGEMENT_DOMAINS)[number];

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

export function defaultAccessForRole(role: MemberRole): MemberAccess {
  if (role === 'owner') return { ...FULL_ADMIN_ACCESS };
  return { ...EMPTY_ACCESS };
}

export function isFullAdminAccess(access: MemberAccess): boolean {
  return (
    access.media === 'admin' &&
    access.solicitation === 'admin' &&
    access.assistant === 'admin' &&
    access.legislative === 'admin'
  );
}

export function isOverallAdmin(member: Pick<Member, 'role' | 'access'> | null | undefined): boolean {
  if (!member) return false;
  return member.role === 'owner' || (member.role === 'admin' && isFullAdminAccess(member.access ?? EMPTY_ACCESS));
}

export function managedDomains(member: Pick<Member, 'role' | 'access'>): ManagementDomain[] {
  const access = member.access ?? EMPTY_ACCESS;
  if (member.role === 'owner' || isFullAdminAccess(access)) return [...MANAGEMENT_DOMAINS];
  return MANAGEMENT_DOMAINS.filter((domain) => access[domain] === 'admin');
}

export function assignableDomainsForActor(
  actor: Pick<Member, 'role' | 'access'> | null | undefined,
): ManagementDomain[] {
  if (!actor) return [];
  if (isOverallAdmin(actor)) return [...MANAGEMENT_DOMAINS];
  return managedDomains(actor);
}

export function dashboardTabsForMember(member: Pick<Member, 'role' | 'access'> | null | undefined): ManagementDomain[] {
  if (!member) return [...MANAGEMENT_DOMAINS];
  const access = member.access ?? EMPTY_ACCESS;
  if (member.role === 'owner') return [...MANAGEMENT_DOMAINS];
  return MANAGEMENT_DOMAINS.filter((domain) => access[domain] === 'admin');
}

export function memberHasAccessInDomain(member: Pick<Member, 'access'>, domain: ManagementDomain): boolean {
  const access = member.access ?? EMPTY_ACCESS;
  return access[domain] !== 'none';
}

export function memberManagedByActor(
  actor: Pick<Member, 'role' | 'access'>,
  target: Pick<Member, 'role' | 'access'>,
): boolean {
  if (target.role === 'owner') return false;
  if (isOverallAdmin(actor)) return true;
  if (actor.role !== 'admin') return false;
  const domains = managedDomains(actor);
  return domains.some((domain) => memberHasAccessInDomain(target, domain));
}

export function filterMembersForActor(actor: Member | null | undefined, members: Member[]): Member[] {
  if (!actor || isOverallAdmin(actor)) return members;
  if (actor.role !== 'admin') return [];
  return members.filter((row) => memberManagedByActor(actor, row));
}

export function memberCanAccess(member: Member | null | undefined, module: AppModule): boolean {
  if (!member || member.status === 'disabled') return false;
  if (member.role === 'owner') return true;
  const access = member.access ?? EMPTY_ACCESS;
  if (module === 'dashboard') return dashboardTabsForMember(member).length > 0;
  if (module === 'users') return member.role === 'admin';
  if (module === 'notifications' || module === 'activity') {
    return dashboardTabsForMember(member).length > 0;
  }
  if (module === 'solicitation') return access.solicitation !== 'none';
  if (module === 'media') return access.media !== 'none';
  if (module === 'assistant') return access.assistant !== 'none';
  if (module === 'legislative') return access.legislative !== 'none';
  return false;
}

export function accessSummary(member: Member, labels: Record<string, string>): string {
  if (member.role === 'owner' || isFullAdminAccess(member.access ?? EMPTY_ACCESS)) {
    return labels.allPermissions ?? labels.all ?? 'All access';
  }
  const access = member.access ?? EMPTY_ACCESS;
  const parts: string[] = [];
  if (access.media !== 'none') parts.push(`${labels.media}: ${labels[`media_${access.media}`]}`);
  if (access.solicitation !== 'none') {
    parts.push(`${labels.solicitation}: ${labels[`solicitation_${access.solicitation}`]}`);
  }
  if (access.assistant !== 'none') {
    parts.push(`${labels.assistant}: ${labels[`assistant_${access.assistant}`]}`);
  }
  if (access.legislative !== 'none') {
    parts.push(`${labels.legislative}: ${labels[`legislative_${access.legislative}`]}`);
  }
  return parts.length ? parts.join(' · ') : labels.none;
}

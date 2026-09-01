/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { defaultSolicitRole, type MemberRecord, type SolicitRole } from '../members/members-types';

export type { SolicitRole };
export { defaultSolicitRole };
export type SolicitAction =
  | 'assign'
  | 'review'
  | 'approve'
  | 'ready_to_claim'
  | 'override'
  | 'reject'
  | 'release'
  | 'flag'
  | 'report';

export function resolveSolicitRole(member?: Pick<MemberRecord, 'role' | 'solicitRole' | 'access'>): SolicitRole {
  if (!member) return 'admin';
  if (member.access?.solicitation === 'admin') return 'admin';
  if (member.access?.solicitation === 'accountant') return 'accountant';
  if (member.access?.solicitation === 'reviewer') return 'reviewer';
  if (member.solicitRole === 'admin' || member.solicitRole === 'reviewer' || member.solicitRole === 'accountant') {
    return member.solicitRole;
  }
  return defaultSolicitRole(member.role, member.access);
}

export function canSolicit(role: SolicitRole, action: SolicitAction): boolean {
  if (role === 'admin') return true;
  if (role === 'reviewer') return action === 'review' || action === 'reject' || action === 'flag';
  return action === 'ready_to_claim' || action === 'release';
}

export function rowVisibleTo(role: SolicitRole, actorUid: string | undefined, row: {
  assignedReviewerUid?: string;
  assignedAccountantUid?: string;
  status: string;
}): boolean {
  if (role === 'admin' || !actorUid) return true;
  if (role === 'reviewer') {
    return !row.assignedReviewerUid || row.assignedReviewerUid === actorUid;
  }
  if (row.status !== 'eligible' && row.status !== 'ready_to_claim' && row.status !== 'claimed') return false;
  return !row.assignedAccountantUid || row.assignedAccountantUid === actorUid;
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Member } from '@/features/users/types/member';

export function personName(members: Member[], personUid: string, empty = '—'): string {
  if (!personUid) return empty;
  return members.find((member) => member.uid === personUid)?.displayName ?? personUid;
}

export function personNames(members: Member[], uids: string[], empty = '—'): string {
  const names = uids.map((uid) => personName(members, uid, '')).filter(Boolean);
  return names.length ? names.join(', ') : empty;
}

export function sameUids(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const lookup = new Set(left);
  return right.every((uid) => lookup.has(uid));
}

export function assignableMembers(members: Member[]): Member[] {
  return members.filter((member) => member.status !== 'disabled');
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { MemberStatus } from '../types/member';

export function memberIsEnabled(status: MemberStatus): boolean {
  return status !== 'disabled';
}

export function statusAfterToggle(current: MemberStatus, enabled: boolean): MemberStatus {
  if (!enabled) return 'disabled';
  return current === 'invited' ? 'invited' : 'active';
}

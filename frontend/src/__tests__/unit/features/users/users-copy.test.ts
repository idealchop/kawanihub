/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { memberIsEnabled, statusAfterToggle } from '@/features/users/lib/member-status';
import { getUsersCopy, withMemberName } from '@/features/users/lib/users-copy';
import { ASSIGNABLE_MEMBER_ROLES } from '@/features/users/types/member';

describe('users copy', () => {
  it('fills the member name in dialog copy', () => {
    const copy = getUsersCopy('en');
    expect(withMemberName(copy.changeRoleDescription, 'Ana Kawani')).toBe(
      'Pick a new desk role for Ana Kawani.',
    );
    expect(withMemberName(copy.deleteDescription, 'Ana Kawani')).toBe(
      'Remove Ana Kawani from this desk? They will lose access.',
    );
  });
});

describe('assignable member roles', () => {
  it('lets the desk pick admin, assistant, or member, not owner', () => {
    expect(ASSIGNABLE_MEMBER_ROLES).toEqual(['admin', 'assistant', 'member']);
  });
});

describe('member desk access', () => {
  it('treats invited as still on the desk', () => {
    expect(memberIsEnabled('active')).toBe(true);
    expect(memberIsEnabled('invited')).toBe(true);
    expect(memberIsEnabled('disabled')).toBe(false);
  });

  it('turns the switch off to disabled and keeps an invite when left on', () => {
    expect(statusAfterToggle('invited', false)).toBe('disabled');
    expect(statusAfterToggle('invited', true)).toBe('invited');
    expect(statusAfterToggle('disabled', true)).toBe('active');
  });
});

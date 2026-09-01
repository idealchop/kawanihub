/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { moduleForDeskPath } from '@/features/dashboard/lib/desk-path-module';

describe('moduleForDeskPath', () => {
  it('maps desk routes to modules', () => {
    expect(moduleForDeskPath('/dashboard')).toBe('dashboard');
    expect(moduleForDeskPath('/queue')).toBe('solicitation');
    expect(moduleForDeskPath('/media/types')).toBe('media');
    expect(moduleForDeskPath('/legislative')).toBe('legislative');
    expect(moduleForDeskPath('/users')).toBe('users');
  });

  it('returns null for unknown paths', () => {
    expect(moduleForDeskPath('/login')).toBeNull();
  });
});

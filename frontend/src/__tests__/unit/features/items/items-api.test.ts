/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { appConfig } from '@/config/app-config';

describe('items api paths', () => {
  it('scopes the sample domain under a workspace', () => {
    expect(appConfig.defaultWorkspaceId.length).toBeGreaterThan(0);
    expect(`/workspaces/${appConfig.defaultWorkspaceId}/items`).toMatch(/^\/workspaces\/.+\/items$/);
  });
});

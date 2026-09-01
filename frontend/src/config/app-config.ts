/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from './brand';

function defaultApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:8080`;
  return 'http://localhost:8080';
}

export const appConfig = {
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== 'false',
  get apiBaseUrl() {
    return defaultApiBaseUrl();
  },
  defaultWorkspaceId: process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? 'demo-workspace',
  productSlug: brand.productSlug,
} as const;

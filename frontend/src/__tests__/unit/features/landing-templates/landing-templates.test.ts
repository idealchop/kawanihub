/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  getLandingTemplate,
  isLandingTemplateSlug,
  landingTemplateSlugs,
} from '@/features/landing-templates';

describe('landing templates', () => {
  it('exposes the four white-label layouts', () => {
    expect([...landingTemplateSlugs]).toEqual(['product', 'waitlist', 'pricing', 'story']);
    expect(isLandingTemplateSlug('product')).toBe(true);
    expect(isLandingTemplateSlug('unknown')).toBe(false);
    expect(getLandingTemplate('pricing')?.title).toBe('Pricing');
  });
});

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { LandingTemplateSlug } from '../lib/landing-templates';
import { PricingLanding } from './pricing-landing';
import { ProductLanding } from './product-landing';
import { StoryLanding } from './story-landing';
import { WaitlistLanding } from './waitlist-landing';

export function LandingTemplatePage({ slug }: { slug: LandingTemplateSlug }) {
  if (slug === 'waitlist') return <WaitlistLanding />;
  if (slug === 'pricing') return <PricingLanding />;
  if (slug === 'story') return <StoryLanding />;
  return <ProductLanding />;
}

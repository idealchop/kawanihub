/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { productTitle } from '@/config/brand';
import { LandingFooter } from '@/features/marketing-ui';
import { LandingTemplateIndex } from '@/features/landing-templates';

export const metadata: Metadata = {
  title: productTitle('Landing pages'),
  description: 'White-label landing page templates by River Tech.',
};

export default function LandingIndexPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingTemplateIndex />
      <div className="mt-auto">
        <LandingFooter />
      </div>
    </div>
  );
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { LandingFooter } from '@/features/marketing-ui';
import { ComponentGallery, galleryCopy } from '@/features/component-gallery';
import { productTitle } from '@/config/brand';

export const metadata: Metadata = {
  title: productTitle(galleryCopy.title),
  description: galleryCopy.description,
};

export default function ComponentsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ComponentGallery />
      <div className="mt-auto">
        <LandingFooter />
      </div>
    </div>
  );
}

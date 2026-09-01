/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '@/config/brand';
import { CopyrightNotice } from '@/components/copyright-notice';

export function LandingFooter() {
  return (
    <footer className="border-t px-4 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {brand.productName} is operated by {brand.legalName}.
        </p>
        <CopyrightNotice />
      </div>
    </footer>
  );
}

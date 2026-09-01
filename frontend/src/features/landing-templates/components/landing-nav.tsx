/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';

export function LandingNav({ current }: { current?: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" aria-label="Home">
        <BrandMark />
      </Link>
      <nav className="flex flex-wrap items-center gap-2">
        <Button asChild variant={current === 'landing' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/landing">Landings</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/components">Components</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
      </nav>
    </header>
  );
}

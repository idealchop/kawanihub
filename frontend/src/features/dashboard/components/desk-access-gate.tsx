/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { memberCanAccess, useCurrentMember } from '@/features/users';
import { moduleForDeskPath } from '../lib/desk-path-module';

export function DeskAccessGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const chrome = getLocaleCopy(locale);
  const { member, loading } = useCurrentMember();
  const module = useMemo(() => moduleForDeskPath(pathname), [pathname]);

  useEffect(() => {
    if (loading || !module || !member) return;
    if (!memberCanAccess(member, module)) {
      router.replace('/dashboard');
    }
  }, [loading, member, module, router]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">{chrome.loading}</div>;
  }

  if (module && member && !memberCanAccess(member, module)) {
    return null;
  }

  return children;
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/brand-mark';
import { CopyrightNotice } from '@/components/copyright-notice';
import { useLocale } from '@/features/locale';
import { memberCanAccess, useCurrentMember } from '@/features/users';
import { cn } from '@/lib/utils';
import { getDashboardCopy } from '../lib/dashboard-copy';
import { navItems } from '../lib/nav-items';

export function DashboardSidebar({ open }: { open: boolean }) {
  const pathname = usePathname();
  const { member, loading } = useCurrentMember();
  const { locale } = useLocale();
  const copy = getDashboardCopy(locale);
  const visible = navItems.filter((item) => !loading && member && memberCanAccess(member, item.module));

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-b bg-card transition-[width] duration-200 md:sticky md:top-0 md:min-h-dvh md:border-b-0 md:border-r',
        open ? 'w-full md:w-56' : 'hidden md:flex md:w-0 md:overflow-hidden md:border-r-0',
      )}
    >
      <div className="shrink-0 border-b px-4 py-4">
        <BrandMark />
      </div>
      {open ? (
        <>
          <nav className="flex flex-1 gap-1 overflow-x-auto p-3 md:flex-col md:overflow-y-auto md:overflow-x-visible">
            {visible.map((item) => {
              const active = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {copy.nav[item.module]}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto shrink-0 border-t px-4 py-3">
            <CopyrightNotice />
          </div>
        </>
      ) : null}
    </aside>
  );
}

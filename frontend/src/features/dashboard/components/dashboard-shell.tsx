/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth-ui';
import { LanguageSwitcher, getLocaleCopy, useLocale } from '@/features/locale';
import { getDashboardCopy } from '../lib/dashboard-copy';
import { DashboardSidebar } from './dashboard-sidebar';
import { DeskAccessGate } from './desk-access-gate';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready, signOut } = useAuth();
  const { locale } = useLocale();
  const chrome = getLocaleCopy(locale);
  const dashboardCopy = getDashboardCopy(locale);
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    if (ready && !session) {
      router.replace('/login');
    }
  }, [ready, session, router]);

  if (!ready || !session) {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">{chrome.loading}</div>;
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <DashboardSidebar open={navOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label={navOpen ? dashboardCopy.sidebarHide : dashboardCopy.sidebarShow}
              onClick={() => setNavOpen((value) => !value)}
            >
              {navOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </Button>
            <p className="truncate text-sm text-muted-foreground">{session.username ?? session.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher id="dashboard-language" />
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
            >
              {chrome.signOut}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <DeskAccessGate>{children}</DeskAccessGate>
        </main>
      </div>
    </div>
  );
}

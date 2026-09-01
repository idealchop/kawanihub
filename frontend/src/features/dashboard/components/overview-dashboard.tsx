/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkInProgressState } from '@/components/ui/work-in-progress-state';
import { getAssistantCopy } from '@/features/assistant/lib/assistant-copy';
import { getLegislativeCopy } from '@/features/legislative/lib/legislative-copy';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { useCurrentMember } from '@/features/users';
import { dashboardTabsForMember, type ManagementDomain } from '@/features/users/lib/member-access';
import { useAnalytics } from '../hooks/use-analytics';
import { getDashboardCopy } from '../lib/dashboard-copy';
import { formatPeso } from '../lib/format-peso';
import { queueHref } from '../lib/las-pinas-districts';
import { FUND_COLORS, PIPELINE_COLORS } from '../lib/las-pinas-map-model';
import { LasPinasBarangayMap } from './las-pinas-barangay-map';
import { MediaDashboardPanel } from './media-dashboard-panel';
import { MixBar } from './mix-bar';

export function OverviewDashboard() {
  const { analytics, loading, error } = useAnalytics();
  const { member, loading: memberLoading } = useCurrentMember();
  const { locale } = useLocale();
  const dashboardCopy = getDashboardCopy(locale);
  const assistantCopy = getAssistantCopy(locale);
  const legislativeCopy = getLegislativeCopy(locale);
  const chrome = getLocaleCopy(locale);
  const byStatus = analytics?.solicitations.byStatus ?? {};
  const open = analytics?.solicitations.open ?? 0;
  const tabs = useMemo(() => (memberLoading ? [] : dashboardTabsForMember(member)), [member, memberLoading]);
  const [desk, setDesk] = useState<ManagementDomain>('solicitation');

  useEffect(() => {
    if (tabs.length && !tabs.includes(desk)) setDesk(tabs[0]);
  }, [desk, tabs]);

  const tabLabel: Record<ManagementDomain, string> = {
    solicitation: dashboardCopy.solicitationTab,
    media: dashboardCopy.mediaTab,
    assistant: dashboardCopy.assistantTab,
    legislative: dashboardCopy.legislativeTab,
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{dashboardCopy.title}</h1>
        <p className="text-sm text-muted-foreground">
          {desk === 'media'
            ? dashboardCopy.mediaDescription
            : desk === 'assistant'
              ? assistantCopy.workInProgress
              : desk === 'legislative'
                ? legislativeCopy.workInProgress
                : analytics
                  ? dashboardCopy.openSummary(analytics.solicitations.open)
                  : dashboardCopy.description}
        </p>
      </div>

      {memberLoading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Tabs value={desk} onValueChange={(value) => setDesk(value as ManagementDomain)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tabLabel[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="solicitation" className="mt-4 space-y-4">
          {analytics ? (
            <>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label={dashboardCopy.cards.pendingReview}
                    value={byStatus.under_review ?? 0}
                    share={open}
                    color={PIPELINE_COLORS.under_review}
                    href={queueHref({ status: 'under_review' })}
                  />
                  <StatCard
                    label={dashboardCopy.cards.forApproval}
                    value={byStatus.pending_validation ?? 0}
                    share={open}
                    color={PIPELINE_COLORS.pending_validation}
                    href={queueHref({ status: 'pending_validation' })}
                  />
                  <StatCard
                    label={dashboardCopy.cards.eligible}
                    value={byStatus.eligible ?? 0}
                    share={open}
                    color={PIPELINE_COLORS.eligible}
                    href={queueHref({ status: 'eligible' })}
                  />
                  <StatCard
                    label={dashboardCopy.cards.readyToClaim}
                    value={byStatus.ready_to_claim ?? 0}
                    share={open}
                    color={PIPELINE_COLORS.ready_to_claim}
                    href={queueHref({ status: 'ready_to_claim' })}
                  />
                </div>

                {analytics.solicitations.fund ? (
                  <FundCard
                    allotted={analytics.solicitations.fund.allotted}
                    remaining={analytics.solicitations.fund.remaining}
                    claimed={analytics.solicitations.fund.claimed}
                    readyToClaim={analytics.solicitations.fund.readyToClaim}
                    copy={dashboardCopy}
                  />
                ) : null}
              </div>

              <section className="space-y-3 border-t pt-5">
                <h2 className="text-sm font-medium tracking-tight text-muted-foreground">{dashboardCopy.briefingTitle}</h2>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{dashboardCopy.barangayLoad}</CardTitle>
                    <CardDescription>{dashboardCopy.barangayLoadHint}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <LasPinasBarangayMap locale={locale} />
                  </CardContent>
                </Card>
              </section>
            </>
          ) : null}
        </TabsContent>
        <TabsContent value="media" className="mt-4">
          <MediaDashboardPanel />
        </TabsContent>
        <TabsContent value="assistant" className="mt-4">
          <WorkInProgressState title={assistantCopy.title} message={assistantCopy.workInProgress} />
        </TabsContent>
        <TabsContent value="legislative" className="mt-4">
          <WorkInProgressState title={legislativeCopy.title} message={legislativeCopy.workInProgress} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FundCard({
  allotted,
  remaining,
  claimed,
  readyToClaim,
  copy,
}: {
  allotted: number;
  remaining: number;
  claimed: number;
  readyToClaim: number;
  copy: ReturnType<typeof getDashboardCopy>;
}) {
  const over = remaining < 0;
  return (
    <Card className="flex flex-col justify-between overflow-hidden">
      <div className="h-1" style={{ backgroundColor: FUND_COLORS.readyToClaim }} />
      <CardHeader className="space-y-1 p-4 pb-2">
        <CardDescription>{copy.fundTitle}</CardDescription>
        <p className="text-xs text-muted-foreground">{over ? copy.fundOver : copy.fundRemaining}</p>
        <CardTitle className={`text-2xl tabular-nums tracking-tight ${over ? 'text-destructive' : ''}`}>
          {formatPeso(remaining)}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{copy.fundOfAllotted(formatPeso(allotted))}</p>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <MixBar
          showLegend={false}
          formatValue={formatPeso}
          items={[
            { key: 'remaining', label: copy.fundRemaining, value: Math.max(0, remaining), color: FUND_COLORS.remaining },
            { key: 'ready', label: copy.fundReady, value: readyToClaim, color: FUND_COLORS.readyToClaim },
            { key: 'claimed', label: copy.fundClaimed, value: claimed, color: FUND_COLORS.claimed },
          ]}
        />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: FUND_COLORS.claimed }} />
              {copy.fundClaimed}
            </dt>
            <dd className="mt-0.5 tabular-nums tracking-tight">{formatPeso(claimed)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: FUND_COLORS.readyToClaim }} />
              {copy.fundReady}
            </dt>
            <dd className="mt-0.5 tabular-nums tracking-tight">{formatPeso(readyToClaim)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  share,
  color,
  href,
}: {
  label: string;
  value: number;
  share: number;
  color: string;
  href: string;
}) {
  const width = share > 0 ? Math.round((value / share) * 100) : 0;
  return (
    <Link href={href} className="block min-w-0">
      <Card className="h-full overflow-hidden transition-colors hover:bg-accent/40">
        <div className="h-1" style={{ backgroundColor: color }} />
        <CardHeader className="p-3.5 sm:p-4">
          <CardDescription className="text-xs leading-snug">{label}</CardDescription>
          <CardTitle className="text-2xl tabular-nums tracking-tight">{value}</CardTitle>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

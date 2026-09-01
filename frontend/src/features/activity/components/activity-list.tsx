/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getActivityCopy } from '../lib/activity-copy';
import { useActivity } from '../hooks/use-activity';
import type { ActivityLog } from '../types/activity';

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function ActivityList() {
  const { locale } = useLocale();
  const activityCopy = getActivityCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { logs, loading, error } = useActivity();

  const columns: DataTableColumn<ActivityLog>[] = [
    { id: 'action', header: activityCopy.action, accessor: (row) => row.action, sortable: true, render: (row) => <Badge>{row.action}</Badge> },
    { id: 'actorUid', header: activityCopy.actor, accessor: (row) => row.actorName || row.actorUid, sortable: true },
    { id: 'resource', header: activityCopy.resource, accessor: (row) => row.resource, sortable: true },
    { id: 'resourceId', header: 'ID', accessor: (row) => row.resourceId },
    { id: 'createdAt', header: activityCopy.when, accessor: (row) => row.createdAt, sortable: true, render: (row) => formatWhen(row.createdAt) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{activityCopy.title}</h1>
        <p className="text-sm text-muted-foreground">{activityCopy.description}</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <DataTable
          rows={logs}
          columns={columns}
          getRowId={(row) => row.id}
          searchValue={(row) => `${row.action} ${row.actorName ?? ''} ${row.actorUid} ${row.resource} ${row.detail ?? ''}`}
          pageSize={10}
          emptyTitle={activityCopy.empty}
          renderCard={(row) => (
            <Card>
              <CardHeader>
                <CardTitle>{row.action}</CardTitle>
                <CardDescription>
                  {row.actorUid} · {row.resource} · {formatWhen(row.createdAt)}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        />
      ) : null}
    </div>
  );
}

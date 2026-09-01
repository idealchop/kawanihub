/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn, type DataTableFilter } from '@/components/ui/data-table';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getNotificationsCopy } from '../lib/notifications-copy';
import { useNotifications } from '../hooks/use-notifications';
import { NotificationForm } from './notification-form';
import type { DeskNotification, NotificationKind } from '../types/notification';

export function NotificationList() {
  const { locale } = useLocale();
  const notificationsCopy = getNotificationsCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { notifications, loading, error, createNotification, updateNotification, deleteNotification } = useNotifications();

  const columns: DataTableColumn<DeskNotification>[] = [
    { id: 'title', header: notificationsCopy.titleLabel, accessor: (row) => row.title, sortable: true },
    { id: 'body', header: notificationsCopy.bodyLabel, accessor: (row) => row.body || '—' },
    {
      id: 'kind',
      header: notificationsCopy.kindLabel,
      accessor: (row) => row.kind,
      render: (row) => <Badge variant="outline">{notificationsCopy.kinds[row.kind]}</Badge>,
    },
    {
      id: 'read',
      header: 'Status',
      accessor: (row) => (row.read ? 'read' : 'unread'),
      render: (row) => (
        <Badge variant={row.read ? 'secondary' : 'default'}>{row.read ? notificationsCopy.read : notificationsCopy.unread}</Badge>
      ),
    },
  ];

  const filters: DataTableFilter<DeskNotification>[] = [
    {
      id: 'kind',
      label: notificationsCopy.kindLabel,
      options: (Object.keys(notificationsCopy.kinds) as NotificationKind[]).map((value) => ({
        value,
        label: notificationsCopy.kinds[value],
      })),
      getValue: (row) => row.kind,
    },
  ];

  async function toggleRead(row: DeskNotification) {
    try {
      await updateNotification(row.id, { read: !row.read });
      toast.success(notificationsCopy.updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.updateFailed);
    }
  }

  async function remove(row: DeskNotification) {
    try {
      await deleteNotification(row.id);
      toast.success(notificationsCopy.deleted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.deleteFailed);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{notificationsCopy.title}</h1>
        <p className="text-sm text-muted-foreground">{notificationsCopy.description}</p>
      </div>

      <NotificationForm onCreate={createNotification} />

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <DataTable
          rows={notifications}
          columns={[
            ...columns,
            {
              id: 'actions',
              header: 'Kilos',
              accessor: (row) => row.id,
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => void toggleRead(row)}>
                    {row.read ? notificationsCopy.markUnread : notificationsCopy.markRead}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => void remove(row)}>
                    {notificationsCopy.delete}
                  </Button>
                </div>
              ),
            },
          ]}
          getRowId={(row) => row.id}
          searchValue={(row) => `${row.title} ${row.body}`}
          filters={filters}
          pageSize={10}
          emptyTitle={notificationsCopy.empty}
          renderCard={(row) => (
            <Card>
              <CardHeader>
                <CardTitle>{row.title}</CardTitle>
                <CardDescription>{row.body || '—'}</CardDescription>
              </CardHeader>
              <CardFooter className="flex-wrap justify-between gap-2">
                <Badge variant={row.read ? 'secondary' : 'default'}>{row.read ? notificationsCopy.read : notificationsCopy.unread}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => void toggleRead(row)}>
                    {row.read ? notificationsCopy.markUnread : notificationsCopy.markRead}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => void remove(row)}>
                    {notificationsCopy.delete}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        />
      ) : null}
    </div>
  );
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { cn } from '@/lib/utils';
import { DeleteMediaContentTypeDialog } from './delete-media-content-type-dialog';
import { MediaContentTypeDialog } from './media-content-type-dialog';
import { contentTypeBadgeClass } from '../lib/content-type-badge';
import { ContentTypeIcon } from '../lib/content-type-icons';
import { getMediaCopy } from '../lib/media-copy';
import { useMediaContentTypes } from '../hooks/use-media-content-types';
import type { MediaContentType } from '../types/media-content-type';

type TypeAction = { type: 'create' } | { type: 'edit'; row: MediaContentType } | { type: 'delete'; row: MediaContentType };

export function MediaContentTypeList() {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { types, loading, error, createMediaContentType, updateMediaContentType, deleteMediaContentType } =
    useMediaContentTypes();
  const [action, setAction] = useState<TypeAction | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  async function setActive(row: MediaContentType, enabled: boolean) {
    const status = enabled ? 'active' : 'inactive';
    if (status === row.status) return;
    setStatusPendingId(row.id);
    try {
      await updateMediaContentType(row.id, {
        name: row.name,
        hint: row.hint,
        icon: row.icon,
        status,
      });
      toast.success(mediaCopy.typeUpdated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.updateFailed);
    } finally {
      setStatusPendingId(null);
    }
  }

  const columns: DataTableColumn<MediaContentType>[] = [
    {
      id: 'details',
      header: mediaCopy.detailsLabel,
      accessor: (row) => `${row.name} ${row.hint} ${row.icon}`,
      sortable: true,
      render: (row) => (
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn('mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg', contentTypeBadgeClass(row.icon))}>
            <ContentTypeIcon icon={row.icon} className="size-4" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium leading-tight">{row.name}</p>
            {row.hint ? <p className="text-xs text-muted-foreground">{row.hint}</p> : null}
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      header: mediaCopy.statusLabel,
      accessor: (row) => row.status,
      className: 'w-[7.5rem]',
      headerClassName: 'w-[7.5rem]',
      render: (row) => (
        <div className="flex flex-col items-start gap-1">
          <Switch
            checked={row.status === 'active'}
            disabled={statusPendingId === row.id}
            onCheckedChange={(enabled) => void setActive(row, enabled)}
            aria-label={`${row.name}: ${row.status === 'active' ? mediaCopy.typeActive : mediaCopy.inactive}`}
          />
          {row.status === 'inactive' ? <span className="text-[11px] text-muted-foreground">{mediaCopy.inactive}</span> : null}
        </div>
      ),
    },
  ];

  function rowActions(row: MediaContentType) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={`${mediaCopy.openActions}: ${row.name}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2" onSelect={() => setAction({ type: 'edit', row })}>
            <Pencil className="size-4" />
            {mediaCopy.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onSelect={() => setAction({ type: 'delete', row })}
          >
            <Trash2 className="size-4" />
            {mediaCopy.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{mediaCopy.manageTitle}</h1>
          <p className="text-sm text-muted-foreground">{mediaCopy.manageDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/media">
              <ArrowLeft />
              {mediaCopy.backToMedia}
            </Link>
          </Button>
          <Button type="button" onClick={() => setAction({ type: 'create' })}>
            <Plus />
            {mediaCopy.addType}
          </Button>
        </div>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <DataTable
          rows={types}
          columns={[
            ...columns,
            {
              id: 'actions',
              header: mediaCopy.actions,
              accessor: (row) => row.id,
              className: 'w-12 text-right',
              headerClassName: 'w-12 text-right',
              render: (row) => rowActions(row),
            },
          ]}
          getRowId={(row) => row.id}
          searchValue={(row) => `${row.name} ${row.hint} ${row.slug}`}
          pageSize={10}
          emptyTitle={mediaCopy.empty}
          renderCard={(row) => (
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-lg', contentTypeBadgeClass(row.icon))}>
                    <ContentTypeIcon icon={row.icon} className="size-4" />
                  </span>
                  <div>
                    <CardTitle>{row.name}</CardTitle>
                    <CardDescription>{row.hint}</CardDescription>
                  </div>
                </div>
                {rowActions(row)}
              </CardHeader>
              <CardFooter>
                <Switch
                  checked={row.status === 'active'}
                  disabled={statusPendingId === row.id}
                  onCheckedChange={(enabled) => void setActive(row, enabled)}
                  aria-label={`${row.name}: ${row.status === 'active' ? mediaCopy.typeActive : mediaCopy.inactive}`}
                />
              </CardFooter>
            </Card>
          )}
        />
      ) : null}

      <MediaContentTypeDialog
        row={action?.type === 'edit' ? action.row : null}
        usedIcons={types.map((row) => row.icon)}
        open={action?.type === 'create' || action?.type === 'edit'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onCreate={createMediaContentType}
        onUpdate={updateMediaContentType}
      />
      <DeleteMediaContentTypeDialog
        row={action?.type === 'delete' ? action.row : null}
        open={action?.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onDelete={deleteMediaContentType}
      />
    </div>
  );
}

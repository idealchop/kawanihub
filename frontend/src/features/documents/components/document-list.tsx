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
import { getDocumentsCopy } from '../lib/documents-copy';
import { useDocuments } from '../hooks/use-documents';
import { DocumentForm } from './document-form';
import { nextDocumentStatus, type DeskDocument, type DocumentKind, type DocumentStatus } from '../types/document';

export function DocumentList() {
  const { locale } = useLocale();
  const documentsCopy = getDocumentsCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { documents, loading, error, createDocument, updateDocument, deleteDocument } = useDocuments();

  const columns: DataTableColumn<DeskDocument>[] = [
    { id: 'referenceNo', header: documentsCopy.referenceLabel, accessor: (row) => row.referenceNo || '—', sortable: true },
    { id: 'title', header: documentsCopy.titleLabel, accessor: (row) => row.title, sortable: true },
    { id: 'requester', header: documentsCopy.requesterLabel, accessor: (row) => row.requester, sortable: true },
    { id: 'barangay', header: documentsCopy.barangayLabel, accessor: (row) => row.barangay || '—' },
    {
      id: 'kind',
      header: documentsCopy.kindLabel,
      accessor: (row) => row.kind,
      render: (row) => <Badge variant="outline">{documentsCopy.kinds[row.kind]}</Badge>,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      render: (row) => <Badge>{documentsCopy.statuses[row.status]}</Badge>,
    },
    { id: 'dueAt', header: documentsCopy.dueLabel, accessor: (row) => row.dueAt || '—' },
  ];

  const filters: DataTableFilter<DeskDocument>[] = [
    {
      id: 'status',
      label: 'Status',
      options: (Object.keys(documentsCopy.statuses) as DocumentStatus[]).map((value) => ({
        value,
        label: documentsCopy.statuses[value],
      })),
      getValue: (row) => row.status,
    },
    {
      id: 'kind',
      label: documentsCopy.kindLabel,
      options: (Object.keys(documentsCopy.kinds) as DocumentKind[]).map((value) => ({
        value,
        label: documentsCopy.kinds[value],
      })),
      getValue: (row) => row.kind,
    },
  ];

  async function advance(row: DeskDocument) {
    try {
      await updateDocument(row.id, {
        title: row.title,
        referenceNo: row.referenceNo,
        requester: row.requester,
        barangay: row.barangay,
        kind: row.kind,
        status: nextDocumentStatus[row.status],
        dueAt: row.dueAt,
        notes: row.notes,
      });
      toast.success(documentsCopy.updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.updateFailed);
    }
  }

  async function remove(row: DeskDocument) {
    try {
      await deleteDocument(row.id);
      toast.success(documentsCopy.deleted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.deleteFailed);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{documentsCopy.title}</h1>
        <p className="text-sm text-muted-foreground">{documentsCopy.description}</p>
      </div>

      <DocumentForm onCreate={createDocument} />

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <DataTable
          rows={documents}
          columns={[
            ...columns,
            {
              id: 'actions',
              header: 'Kilos',
              accessor: (row) => row.id,
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => void advance(row)}>
                    {documentsCopy.nextStatus}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => void remove(row)}>
                    {documentsCopy.delete}
                  </Button>
                </div>
              ),
            },
          ]}
          getRowId={(row) => row.id}
          searchValue={(row) => `${row.title} ${row.referenceNo} ${row.requester} ${row.barangay}`}
          filters={filters}
          pageSize={10}
          emptyTitle={documentsCopy.empty}
          renderCard={(row) => (
            <Card>
              <CardHeader>
                <CardTitle>{row.title}</CardTitle>
                <CardDescription>
                  {row.requester}
                  {row.referenceNo ? ` · ${row.referenceNo}` : ''}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex-wrap justify-between gap-2">
                <Badge>{documentsCopy.statuses[row.status]}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => void advance(row)}>
                    {documentsCopy.nextStatus}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => void remove(row)}>
                    {documentsCopy.delete}
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

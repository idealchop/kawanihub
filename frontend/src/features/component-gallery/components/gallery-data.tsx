/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn, type DataTableFilter } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { galleryTableRows, type GalleryTableRow } from '../lib/gallery-table-rows';
import { GallerySection } from './gallery-section';

const columns: DataTableColumn<GalleryTableRow>[] = [
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
  { id: 'owner', header: 'Owner', accessor: (row) => row.owner, sortable: true },
  { id: 'kind', header: 'Kind', accessor: (row) => row.kind, sortable: true },
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => row.status,
    sortable: true,
    render: (row) => <Badge variant={row.status === 'archived' ? 'outline' : 'secondary'}>{row.status}</Badge>,
  },
  { id: 'updated', header: 'Updated', accessor: (row) => row.updated, sortable: true },
];

const filters: DataTableFilter<GalleryTableRow>[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'done', label: 'Done' },
      { value: 'archived', label: 'Archived' },
    ],
    getValue: (row) => row.status,
  },
  {
    id: 'kind',
    label: 'Kind',
    options: [
      { value: 'product', label: 'Product' },
      { value: 'template', label: 'Template' },
    ],
    getValue: (row) => row.kind,
  },
];

const simpleRows = [
  { name: 'Kawanihub', status: 'open' },
  { name: 'Workspace A', status: 'done' },
];

export function GalleryData() {
  return (
    <>
      <GallerySection id="data" title="Data" description="Cards on mobile. Table from md up.">
        <div className="grid gap-3 md:hidden">
          {simpleRows.map((row) => (
            <Card key={row.name}>
              <CardHeader>
                <CardTitle>{row.name}</CardTitle>
                <CardDescription>Sample domain row.</CardDescription>
              </CardHeader>
              <CardFooter>
                <Badge variant="secondary">{row.status}</Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-xl border md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simpleRows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GallerySection>

      <GallerySection id="data-table" title="Data table" description="Search, filters, sort, rows per page, and pagination.">
        <DataTable
          rows={galleryTableRows}
          columns={columns}
          getRowId={(row) => row.id}
          searchValue={(row) => `${row.name} ${row.owner}`}
          filters={filters}
          pageSize={10}
          renderCard={(row) => (
            <Card>
              <CardHeader>
                <CardTitle>{row.name}</CardTitle>
                <CardDescription>
                  {row.owner} · {row.kind}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-between">
                <Badge variant="secondary">{row.status}</Badge>
                <span className="text-xs text-muted-foreground">{row.updated}</span>
              </CardFooter>
            </Card>
          )}
        />
      </GallerySection>

      <GallerySection id="states" title="States" description="Required on every list screen.">
        <div className="grid gap-3 md:grid-cols-2">
          <EmptyState title="No items yet" description="Add the first record for this workspace." action={<Button size="sm">Add item</Button>} />
          <EmptyState title="Could not load" description="Start the API, then refresh." />
        </div>
      </GallerySection>
    </>
  );
}

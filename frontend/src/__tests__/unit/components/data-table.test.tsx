/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, type DataTableFilter } from '@/components/ui/data-table';

type Row = { id: string; name: string; status: string };

const rows: Row[] = [
  { id: '1', name: 'Rosa Mendoza', status: 'claimed' },
  { id: '2', name: 'Ben Santos', status: 'under_review' },
];

const columns = [
  {
    id: 'name',
    header: 'Details',
    accessor: (row: Row) => row.name,
  },
];

describe('DataTable', () => {
  it('hides closed rows when All uses matchesAll', () => {
    const filters: DataTableFilter<Row>[] = [
      {
        id: 'status',
        label: 'Status',
        options: [
          { value: 'under_review', label: 'Pending for Review' },
          { value: 'claimed', label: 'Archived' },
        ],
        getValue: (row) => row.status,
        matchesAll: (row) => row.status !== 'claimed',
      },
    ];

    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        filters={filters}
        pageSize={8}
      />,
    );

    expect(screen.getAllByText('Ben Santos').length).toBeGreaterThan(0);
    expect(screen.queryByText('Rosa Mendoza')).toBeNull();
    expect(screen.getByText('1–1 of 1')).toBeTruthy();
  });

  it('clears search from Clear', () => {
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        searchValue={(row) => row.name}
        pageSize={8}
      />,
    );

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'zzz' } });
    expect(screen.getByText('0 results')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByText('1–2 of 2')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull();
  });

  it('clears extra chips from Clear', () => {
    const onClear = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        extraFilterChips={[{ id: 'who', label: 'Editor · Ana', onRemove: () => undefined }]}
        onClearFilters={onClear}
        pageSize={8}
      />,
    );

    expect(screen.getByText('Showing:')).toBeTruthy();
    expect(screen.getByText('Editor · Ana')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onClear).toHaveBeenCalled();
  });
});

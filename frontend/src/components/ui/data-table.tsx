/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getDataTableCopy, withFilterName } from '@/components/ui/lib/data-table-copy';
import { useLocale } from '@/features/locale';
import {
  compareSortValues,
  matchesSearch,
  nextSortDirection,
  pageCount,
  pageRange,
  paginateRows,
  type DataTableFilterOption,
  type DataTableSort,
  type SortDirection,
} from '@/components/ui/lib/data-table-model';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  hidden?: boolean;
  className?: string;
  headerClassName?: string;
};

export type DataTableFilter<T> = {
  id: string;
  label: string;
  options: DataTableFilterOption[];
  getValue: (row: T) => string;
  matches?: (row: T, selected: string) => boolean;
  /** When All is selected. Use to keep closed work out of the default queue. */
  matchesAll?: (row: T) => boolean;
};

export type DataTableFilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

export type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchValue?: (row: T) => string;
  searchPlaceholder?: string;
  filters?: DataTableFilter<T>[];
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyTitle?: string;
  emptyDescription?: string;
  renderCard?: (row: T) => ReactNode;
  /** Inbox-style rows at every breakpoint. Other screens keep the desktop table. */
  layout?: 'table' | 'list';
  defaultSort?: DataTableSort;
  defaultFilters?: Record<string, string>;
  onRowClick?: (row: T) => void;
  toolbarExtra?: ReactNode;
  extraFilterChips?: DataTableFilterChip[];
  onClearFilters?: () => void;
  toolbarExtraBelow?: boolean;
  hideToolbar?: boolean;
};

const ALL = '__all__';
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  searchValue,
  searchPlaceholder,
  filters = [],
  pageSize: initialPageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  emptyTitle,
  emptyDescription,
  renderCard,
  layout = 'table',
  defaultSort,
  defaultFilters,
  onRowClick,
  toolbarExtra,
  extraFilterChips = [],
  onClearFilters,
  toolbarExtraBelow = false,
  hideToolbar = false,
}: DataTableProps<T>) {
  const { locale } = useLocale();
  const dataTableCopy = getDataTableCopy(locale);
  const resolvedEmptyTitle = emptyTitle ?? dataTableCopy.emptyTitle;
  const resolvedEmptyDescription = emptyDescription ?? dataTableCopy.emptyDescription;
  const isList = layout === 'list';
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [id, value] of Object.entries(defaultFilters ?? {})) {
      if (value && value !== ALL) initial[id] = value;
    }
    return initial;
  });
  const [sort, setSort] = useState<DataTableSort | null>(defaultSort ?? null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const searchable = searchValue ? searchValue(row) : columns.map((column) => String(column.accessor(row))).join(' ');
      if (!matchesSearch(searchable, query)) return false;
      return filters.every((filter) => {
        const selected = filterValues[filter.id];
        if (!selected || selected === ALL) {
          return filter.matchesAll ? filter.matchesAll(row) : true;
        }
        if (filter.matches) return filter.matches(row, selected);
        return filter.getValue(row) === selected;
      });
    });
  }, [columns, filterValues, filters, query, rows, searchValue]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column) return filtered;
    return [...filtered].sort((left, right) => {
      const result = compareSortValues(column.accessor(left), column.accessor(right));
      return sort.direction === 'asc' ? result : -result;
    });
  }, [columns, filtered, sort]);

  const totalPages = pageCount(sorted.length, pageSize);
  const safePage = Math.min(page, totalPages);
  const visible = paginateRows(sorted, safePage, pageSize);
  const range = pageRange(safePage, pageSize, sorted.length);
  const visibleColumns = columns.filter((column) => !column.hidden);

  function onSort(columnId: string, sortable?: boolean) {
    if (!sortable) return;
    const current = sort?.columnId === columnId ? sort.direction : null;
    const next = nextSortDirection(current);
    setSort(next ? { columnId, direction: next } : null);
    setPage(1);
  }

  function handleRowClick(row: T, event: { target: EventTarget | null }) {
    if (!onRowClick) return;
    if (event.target instanceof Element && event.target.closest('a, button, input, select, textarea, [role="menuitem"]')) {
      return;
    }
    onRowClick(row);
  }

  const searchField = (
    <div className={cn(isList ? 'flex-1' : 'space-y-2')}>
      <Label htmlFor="data-table-search" className={isList ? 'sr-only' : undefined}>
        {dataTableCopy.searchLabel}
      </Label>
      <div className="relative">
        <Input
          id="data-table-search"
          value={query}
          placeholder={searchPlaceholder ?? dataTableCopy.searchPlaceholder}
          className={cn('pr-8', isList && 'h-10 rounded-xl')}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        {query ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
            aria-label={withFilterName(dataTableCopy.removeFilter, dataTableCopy.searchLabel)}
            onClick={() => {
              setQuery('');
              setPage(1);
            }}
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );

  const filterFields = filters.map((filter) => {
    const selected = filterValues[filter.id] ?? ALL;

    return (
      <div key={filter.id} className={cn('min-w-36', isList ? 'space-y-0' : 'space-y-2')}>
        <Label htmlFor={`data-table-filter-${filter.id}`} className={isList ? 'sr-only' : undefined}>
          {filter.label}
        </Label>
        <Select
          value={selected}
          onValueChange={(value) => {
            setFilterValues((current) => ({ ...current, [filter.id]: value }));
            setPage(1);
          }}
        >
          <SelectTrigger
            id={`data-table-filter-${filter.id}`}
            className={isList ? 'h-10 min-w-36 rounded-xl' : undefined}
            aria-label={filter.label}
          >
            <SelectValue placeholder={dataTableCopy.allFilter} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{isList ? filter.label : dataTableCopy.allFilter}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  });

  const filterChips: DataTableFilterChip[] = filters.flatMap((filter) => {
    const selected = filterValues[filter.id];
    if (!selected || selected === ALL) return [];
    const option = filter.options.find((item) => item.value === selected);
    if (!option) return [];
    return [
      {
        id: filter.id,
        label: option.label,
        onRemove: () => {
          setFilterValues((current) => ({ ...current, [filter.id]: ALL }));
          setPage(1);
        },
      },
    ];
  });
  const searchChip: DataTableFilterChip[] = query.trim()
    ? [
        {
          id: 'search',
          label: query.trim(),
          onRemove: () => {
            setQuery('');
            setPage(1);
          },
        },
      ]
    : [];
  const chips = [...searchChip, ...filterChips, ...extraFilterChips];
  const hasActiveFilters = chips.length > 0;

  function clearAllFilters() {
    setQuery('');
    setFilterValues({});
    setPage(1);
    onClearFilters?.();
  }

  const toolbar = (
    <div className="flex flex-col gap-3">
      <div className={cn('flex flex-wrap gap-3', isList ? 'items-center' : 'items-end')}>
        <div className={cn(isList ? 'min-w-[12rem] flex-1' : 'min-w-[16rem] flex-1')}>{searchField}</div>
        {filterFields}
        {toolbarExtraBelow ? null : toolbarExtra}
      </div>
      {toolbarExtraBelow && toolbarExtra ? (
        <div className={cn('flex flex-wrap gap-3', isList ? 'items-center' : 'items-end')}>{toolbarExtra}</div>
      ) : null}
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border bg-background px-4 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{dataTableCopy.showingFilters}</span>
            {chips.map((chip) => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                removeLabel={withFilterName(dataTableCopy.removeFilter, chip.label)}
                onRemove={() => {
                  chip.onRemove();
                  setPage(1);
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
            onClick={clearAllFilters}
          >
            {dataTableCopy.clearFilters}
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {hideToolbar ? null : toolbar}

      {visible.length === 0 ? (
        <EmptyState title={resolvedEmptyTitle} description={resolvedEmptyDescription} />
      ) : isList ? (
        <div className="overflow-hidden rounded-2xl border bg-card">
          {visible.map((row) => (
            <div
              key={getRowId(row)}
              className={cn('border-b border-border/70 last:border-b-0', onRowClick && 'cursor-pointer')}
              onClick={(event) => handleRowClick(row, event)}
            >
              {renderCard ? renderCard(row) : null}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {visible.map((row) =>
              renderCard ? (
                <div
                  key={getRowId(row)}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                  onClick={(event) => handleRowClick(row, event)}
                >
                  {renderCard(row)}
                </div>
              ) : (
                <Card key={getRowId(row)}>
                  <CardHeader>
                    <CardTitle>{String(columns[0]?.accessor(row) ?? getRowId(row))}</CardTitle>
                    <CardDescription>{String(columns[1]?.accessor(row) ?? '')}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Badge variant="secondary">{String(columns[columns.length - 1]?.accessor(row) ?? '')}</Badge>
                  </CardFooter>
                </Card>
              ),
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.id} className={column.headerClassName}>
                      {column.sortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                          onClick={() => onSort(column.id, true)}
                        >
                          {column.header}
                          <SortIcon
                            active={sort?.columnId === column.id}
                            direction={sort?.columnId === column.id ? sort.direction : null}
                          />
                        </button>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    className={onRowClick ? 'cursor-pointer' : undefined}
                    onClick={(event) => handleRowClick(row, event)}
                  >
                    {visibleColumns.map((column) => (
                      <TableCell key={column.id} className={cn('align-top', column.className)}>
                        {column.render ? column.render(row) : column.accessor(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{dataTableCopy.pageSummary(range.start, range.end, sorted.length)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="data-table-rows" className={isList ? 'sr-only' : 'text-muted-foreground'}>
              {dataTableCopy.rowsLabel}
            </Label>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger id="data-table-rows" className={cn('w-20', isList && 'h-8 rounded-lg')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant={isList ? 'ghost' : 'outline'}
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            {dataTableCopy.previous}
          </Button>
          <Button
            variant={isList ? 'ghost' : 'outline'}
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            {dataTableCopy.next}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection | null }) {
  const iconClass = cn('size-3.5', active ? 'text-foreground' : 'text-muted-foreground');
  if (direction === 'asc') return <ArrowUp className={iconClass} />;
  if (direction === 'desc') return <ArrowDown className={iconClass} />;
  return <ChevronsUpDown className={iconClass} />;
}

function FilterChip({
  label,
  removeLabel,
  onRemove,
}: {
  label: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-md bg-teal-50 px-2 text-xs font-medium text-teal-800">
      {label}
      <button
        type="button"
        className="rounded-sm p-0.5 text-teal-700 hover:bg-teal-100"
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

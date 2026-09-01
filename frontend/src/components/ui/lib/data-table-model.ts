/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

export type SortDirection = 'asc' | 'desc';

export type DataTableSort = {
  columnId: string;
  direction: SortDirection;
};

export type DataTableFilterOption = {
  value: string;
  label: string;
};

export function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesSearch(haystack: string, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle);
}

export function compareSortValues(left: string | number, right: string | number): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return String(left).localeCompare(String(right), undefined, { sensitivity: 'base' });
}

export function nextSortDirection(current: SortDirection | null): SortDirection | null {
  if (current === null) return 'asc';
  if (current === 'asc') return 'desc';
  return null;
}

export function paginateRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

export function pageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

export function pageRange(page: number, pageSize: number, total: number): { start: number; end: number } {
  if (total === 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}

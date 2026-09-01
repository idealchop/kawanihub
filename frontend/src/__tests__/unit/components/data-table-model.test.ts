/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import {
  compareSortValues,
  matchesSearch,
  nextSortDirection,
  pageCount,
  pageRange,
  paginateRows,
} from '@/components/ui/lib/data-table-model';

describe('data-table-model', () => {
  it('matches search case-insensitively', () => {
    expect(matchesSearch('River Kit', 'kit')).toBe(true);
    expect(matchesSearch('River Kit', '  ')).toBe(true);
    expect(matchesSearch('River Kit', 'sales')).toBe(false);
  });

  it('cycles sort direction', () => {
    expect(nextSortDirection(null)).toBe('asc');
    expect(nextSortDirection('asc')).toBe('desc');
    expect(nextSortDirection('desc')).toBeNull();
  });

  it('compares numbers and strings', () => {
    expect(compareSortValues(2, 10)).toBeLessThan(0);
    expect(compareSortValues('Ada', 'Mina')).toBeLessThan(0);
  });

  it('paginates and reports the visible range', () => {
    const rows = [1, 2, 3, 4, 5, 6];
    expect(paginateRows(rows, 2, 5)).toEqual([6]);
    expect(pageCount(12, 5)).toBe(3);
    expect(pageRange(2, 5, 12)).toEqual({ start: 6, end: 10 });
    expect(pageRange(1, 5, 0)).toEqual({ start: 0, end: 0 });
  });
});

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Button } from '@/components/ui/button';
import { getDataTableCopy } from '@/components/ui/lib/data-table-copy';
import { pageCount, pageRange } from '@/components/ui/lib/data-table-model';
import { useLocale } from '@/features/locale';

export function MediaActivityPager({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const { locale } = useLocale();
  const copy = getDataTableCopy(locale);
  const totalPages = pageCount(total, pageSize);
  const range = pageRange(page, pageSize, total);
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">{copy.pageSummary(range.start, range.end, total)}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          {copy.previous}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          {copy.next}
        </Button>
      </div>
    </div>
  );
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Badge } from '@/components/ui/badge';
import { contentTypeBadgeClass } from '../lib/content-type-badge';
import { ContentTypeIcon } from '../lib/content-type-icons';
import { contentTypeBySlug } from '../lib/content-type-lookup';
import type { MediaContentType } from '../types/media-content-type';

export function ContentTypeChip({ types, slug }: { types: MediaContentType[]; slug: string }) {
  const row = contentTypeBySlug(types, slug);
  return (
    <Badge className={contentTypeBadgeClass(row?.icon ?? 'file-text')}>
      {row ? <ContentTypeIcon icon={row.icon} className="mr-1 size-3" /> : null}
      {row?.name ?? slug}
    </Badge>
  );
}

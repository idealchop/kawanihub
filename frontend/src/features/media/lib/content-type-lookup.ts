/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { MediaContentType } from '../types/media-content-type';

export function contentTypeBySlug(types: MediaContentType[], slug: string): MediaContentType | undefined {
  return types.find((row) => row.slug === slug);
}

export function contentTypeLabel(types: MediaContentType[], slug: string): string {
  return contentTypeBySlug(types, slug)?.name ?? slug;
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { MediaType } from '../types/media-piece';

export function mediaTypeHref(type: MediaType): string {
  return `/media/${type}`;
}

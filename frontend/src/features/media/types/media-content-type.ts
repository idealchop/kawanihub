/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export { MEDIA_TYPE_ICONS, type MediaTypeIcon } from '../lib/media-type-icon-catalog';

export const MEDIA_TYPE_STATUSES = ['active', 'inactive'] as const;
export type MediaTypeStatus = (typeof MEDIA_TYPE_STATUSES)[number];

export type MediaContentType = {
  id: string;
  slug: string;
  name: string;
  hint: string;
  icon: MediaTypeIcon;
  status: MediaTypeStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaContentTypeListResponse = {
  types: MediaContentType[];
};

export type MediaContentTypeWriteInput = {
  name: string;
  hint?: string;
  icon: MediaTypeIcon;
  status?: MediaTypeStatus;
};

export function isActiveContentType(row: MediaContentType): boolean {
  return row.status === 'active';
}

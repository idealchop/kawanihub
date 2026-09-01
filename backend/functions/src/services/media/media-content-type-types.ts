/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export const MEDIA_TYPE_ICONS = [
  'camera',
  'film',
  'image',
  'mic',
  'message-square',
  'clapperboard',
  'newspaper',
  'video',
  'music',
  'file-text',
  'podcast',
  'radio',
  'headphones',
  'megaphone',
  'tv',
  'monitor-play',
  'play',
  'volume-2',
  'speaker',
  'disc-3',
  'mic-vocal',
  'cassette-tape',
  'captions',
  'audio-lines',
  'palette',
  'pen-tool',
  'aperture',
  'sparkles',
  'youtube',
  'instagram',
  'share-2',
  'link',
  'globe',
  'users',
  'calendar',
  'smartphone',
  'landmark',
  'gavel',
  'handshake',
  'mail',
  'phone',
  'message-circle',
  'book-open',
  'flag',
  'star',
  'scissors',
] as const;
export type MediaTypeIcon = (typeof MEDIA_TYPE_ICONS)[number];

export const MEDIA_TYPE_STATUSES = ['active', 'inactive'] as const;
export type MediaTypeStatus = (typeof MEDIA_TYPE_STATUSES)[number];

export const RESERVED_MEDIA_TYPE_SLUGS = ['types', 'new'] as const;

export type MediaContentTypeRecord = {
  id: string;
  workspaceId: string;
  slug: string;
  name: string;
  hint: string;
  icon: MediaTypeIcon;
  status: MediaTypeStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { MediaTypeIcon } from '../types/media-content-type';

const CHIP = 'whitespace-nowrap border-transparent';

export function contentTypeBadgeClass(icon: MediaTypeIcon | string): string {
  if (icon === 'camera' || icon === 'image' || icon === 'aperture' || icon === 'instagram') {
    return `${CHIP} bg-blue-100 text-blue-900`;
  }
  if (
    icon === 'film' ||
    icon === 'video' ||
    icon === 'clapperboard' ||
    icon === 'tv' ||
    icon === 'monitor-play' ||
    icon === 'play' ||
    icon === 'youtube' ||
    icon === 'captions'
  ) {
    return `${CHIP} bg-pink-100 text-pink-900`;
  }
  if (
    icon === 'mic' ||
    icon === 'music' ||
    icon === 'podcast' ||
    icon === 'radio' ||
    icon === 'headphones' ||
    icon === 'megaphone' ||
    icon === 'volume-2' ||
    icon === 'speaker' ||
    icon === 'disc-3' ||
    icon === 'mic-vocal' ||
    icon === 'cassette-tape' ||
    icon === 'audio-lines'
  ) {
    return `${CHIP} bg-orange-100 text-orange-900`;
  }
  if (icon === 'newspaper' || icon === 'file-text' || icon === 'book-open' || icon === 'mail') {
    return `${CHIP} bg-sky-100 text-sky-900`;
  }
  return `${CHIP} bg-rose-100 text-rose-900`;
}

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

export const POPULAR_MEDIA_TYPE_ICONS: readonly MediaTypeIcon[] = [
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
];

const DEFAULT_VISIBLE = 10;

const ICON_ALIASES: Record<MediaTypeIcon, string> = {
  camera: 'photo photography stills session',
  film: 'reels reel cinema strip movie',
  image: 'graphics graphic picture photo poster',
  mic: 'podcast audio microphone episode',
  'message-square': 'post chat comment message write',
  clapperboard: 'movie production shoot take',
  newspaper: 'news article press',
  video: 'clip footage camera rec',
  music: 'song audio soundtrack',
  'file-text': 'document paper write',
  podcast: 'audio episode mic show',
  radio: 'broadcast am fm live',
  headphones: 'listen audio ear',
  megaphone: 'announce campaign rally',
  tv: 'television broadcast live',
  'monitor-play': 'stream screen cut',
  play: 'video start clip',
  'volume-2': 'sound audio loud',
  speaker: 'sound pa event',
  'disc-3': 'album vinyl record',
  'mic-vocal': 'singer voice speech',
  'cassette-tape': 'tape analog archive',
  captions: 'subtitles subtitle cc',
  'audio-lines': 'waveform sound mix',
  palette: 'art color design graphics',
  'pen-tool': 'vector draw illustration',
  aperture: 'lens photography photo',
  sparkles: 'fx highlight glow',
  youtube: 'video social channel',
  instagram: 'social reel story',
  'share-2': 'social post send',
  link: 'url website href',
  globe: 'web world site',
  users: 'people team group',
  calendar: 'date schedule shoot',
  smartphone: 'phone mobile story',
  landmark: 'government capitol building',
  gavel: 'law court legal',
  handshake: 'partner agreement',
  mail: 'email letter inbox',
  phone: 'call contact',
  'message-circle': 'chat comment bubble',
  'book-open': 'read story bible',
  flag: 'nation campaign',
  star: 'featured highlight',
  scissors: 'cut edit crop',
};

export function isMediaTypeIcon(value: string): value is MediaTypeIcon {
  return (MEDIA_TYPE_ICONS as readonly string[]).includes(value);
}

function popularIndex(icon: MediaTypeIcon): number {
  const index = POPULAR_MEDIA_TYPE_ICONS.indexOf(icon);
  return index === -1 ? POPULAR_MEDIA_TYPE_ICONS.length : index;
}

function iconMatches(icon: MediaTypeIcon, query: string): boolean {
  return icon.includes(query) || ICON_ALIASES[icon].includes(query);
}

export function visibleMediaTypeIcons(
  query: string,
  usedIcons: readonly string[],
  selected: MediaTypeIcon,
): MediaTypeIcon[] {
  const needle = query.trim().toLowerCase();
  if (needle) {
    return MEDIA_TYPE_ICONS.filter((icon) => iconMatches(icon, needle));
  }

  const counts = new Map<MediaTypeIcon, number>();
  for (const icon of usedIcons) {
    if (!isMediaTypeIcon(icon)) continue;
    counts.set(icon, (counts.get(icon) ?? 0) + 1);
  }

  const usedRanked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || popularIndex(a[0]) - popularIndex(b[0]) || a[0].localeCompare(b[0]))
    .map(([icon]) => icon);
  const popularRest = POPULAR_MEDIA_TYPE_ICONS.filter((icon) => !counts.has(icon));
  const merged = [...usedRanked, ...popularRest];
  if (!merged.includes(selected)) merged.unshift(selected);

  const seen = new Set<MediaTypeIcon>();
  const result: MediaTypeIcon[] = [];
  for (const icon of merged) {
    if (seen.has(icon)) continue;
    seen.add(icon);
    result.push(icon);
    if (result.length >= DEFAULT_VISIBLE) break;
  }

  if (!result.includes(selected) && result.length > 0) {
    result[result.length - 1] = selected;
  }
  return result;
}

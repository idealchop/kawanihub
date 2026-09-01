/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { redirect } from 'next/navigation';
import { MediaPieceList } from '@/features/media';

type MediaTypeParams = { type: string };

export default async function MediaTypePage({ params }: { params: Promise<MediaTypeParams> }) {
  const { type } = await params;
  if (type === 'new' || type === 'types') redirect('/media');
  return <MediaPieceList contentType={type} />;
}

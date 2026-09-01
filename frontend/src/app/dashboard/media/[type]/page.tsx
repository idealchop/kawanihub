/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { redirect } from 'next/navigation';

type MediaTypeParams = { type: string };

export default async function LegacyMediaTypePage({ params }: { params: Promise<MediaTypeParams> }) {
  const { type } = await params;
  redirect(type === 'new' || type === 'types' ? '/media' : `/media/${type}`);
}

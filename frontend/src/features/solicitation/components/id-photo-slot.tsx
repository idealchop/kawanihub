/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IdPhotoSide } from '../types/solicitation';
import { PictogramPapers } from './public-solicit-pictograms';

export function IdPhotoSlot({
  idPrefix,
  side,
  label,
  photo,
  pickLabel,
  onPickFile,
}: {
  idPrefix: string;
  side: IdPhotoSide;
  label: string;
  photo: string;
  pickLabel: string;
  onPickFile: (side: IdPhotoSide, file: File | undefined) => void;
}) {
  const galleryId = `${idPrefix}-id-photo-${side}`;

  return (
    <div className="space-y-2 rounded-xl border p-3">
      <p className="text-base font-semibold">{label}</p>
      <div className="flex min-h-32 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full max-h-40 w-full object-contain" />
        ) : (
          <PictogramPapers className="size-12 text-muted-foreground" />
        )}
      </div>
      <Button asChild size="lg" className="h-14 w-full text-base">
        <label htmlFor={galleryId} className={cn('cursor-pointer')}>
          {pickLabel}
        </label>
      </Button>
      <input
        id={galleryId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          onPickFile(side, file);
        }}
      />
    </div>
  );
}

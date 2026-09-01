/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { cn } from '@/lib/utils';
import { IdPhotoError, makeDummyPaperPhoto, readPaperPhoto } from '../lib/id-photo';
import { getPublicSolicitationCopy } from '../lib/public-solicitation-copy';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import { publicPapersOpen, type PublicSolicitation } from '../types/solicitation';

type PaperDraft = { photo: string; photoName: string };

export function SolicitationRequirementForm({
  row,
  onSubmit,
  autoFillDemo = false,
  demoTick = 0,
}: {
  row: PublicSolicitation;
  onSubmit: (requirements: { id: string; photo: string; photoName?: string }[]) => Promise<unknown>;
  autoFillDemo?: boolean;
  demoTick?: number;
}) {
  const { locale } = useLocale();
  const copy = getPublicSolicitationCopy(locale);
  const deskCopy = getSolicitationCopy(locale);
  const chrome = getLocaleCopy(locale);
  const closed = !publicPapersOpen(row);
  const [papers, setPapers] = useState<Record<string, PaperDraft>>(() =>
    Object.fromEntries(row.requirements.map((item) => [item.id, { photo: item.photo ?? '', photoName: item.photoName ?? '' }])),
  );
  const [pending, setPending] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const autoFilled = useRef(false);

  function labelFor(id: string, fallback: string) {
    return copy.requirementLabels[id as keyof typeof copy.requirementLabels] ?? fallback;
  }

  function photoError(error: unknown): string {
    const code = error instanceof IdPhotoError ? error.code : '';
    if (code === 'type') return copy.papersPhotoBadType;
    if (code === 'too_large') return copy.papersPhotoTooLarge;
    if (code === 'decode') return copy.papersPhotoDecodeFailed;
    return error instanceof Error ? error.message : chrome.saveFailed;
  }

  async function fillDemoPapers() {
    if (closed) return;
    setPending(true);
    try {
      const next: Record<string, PaperDraft> = {};
      for (const item of row.requirements) {
        const photo = await makeDummyPaperPhoto(labelFor(item.id, item.label));
        next[item.id] = { photo: photo.dataUrl, photoName: photo.name };
      }
      setPapers(next);
    } catch (error) {
      toast.error(photoError(error));
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (closed) return;
    if (autoFillDemo && !autoFilled.current) {
      autoFilled.current = true;
      void fillDemoPapers();
      return;
    }
    if (demoTick > 0) void fillDemoPapers();
    // Demo seed only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFillDemo, closed, demoTick]);

  async function onPick(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const photo = await readPaperPhoto(file);
      setPapers((current) => ({ ...current, [id]: { photo: photo.dataUrl, photoName: photo.name } }));
    } catch (error) {
      toast.error(photoError(error));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (closed) return;
    const missing = row.requirements.some((item) => (papers[item.id]?.photo.length ?? 0) < 32);
    if (missing) {
      toast.error(copy.papersNeedAll);
      return;
    }
    setPending(true);
    try {
      await onSubmit(
        row.requirements.map((item) => ({
          id: item.id,
          photo: papers[item.id].photo,
          photoName: papers[item.id].photoName,
        })),
      );
      toast.success(copy.papersDone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border bg-card p-4 md:p-6">
      {row.missingNote ? <p className="rounded-xl bg-amber-50 p-3 text-center text-base text-amber-950">{row.missingNote}</p> : null}
      <p className="text-center text-base text-muted-foreground">
        {row.requesterName}
        {row.beneficiaryName ? ` · ${deskCopy.beneficiaryLabel}: ${row.beneficiaryName}` : ''}
        {row.barangay ? ` · ${row.barangay}` : ''} · {deskCopy.kinds[row.kind]}
      </p>
      <ul className="space-y-3">
        {row.requirements.map((item, index) => {
          const draft = papers[item.id];
          const hasPhoto = Boolean(draft?.photo);
          return (
            <li
              key={item.id}
              className={cn(
                'space-y-3 rounded-xl border px-4 py-3',
                hasPhoto ? 'border-primary bg-primary/5' : 'bg-slate-50',
                closed && 'opacity-80',
              )}
            >
              <div className="flex items-start gap-3 text-base">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="flex-1 pt-1 font-medium">{labelFor(item.id, item.label)}</span>
              </div>
              {hasPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.photo} alt="" className="max-h-48 w-full rounded-lg object-contain" />
              ) : null}
              <input
                ref={(node) => {
                  inputs.current[item.id] = node;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                disabled={closed || pending}
                onChange={(event) => void onPick(item.id, event)}
              />
              {closed ? null : (
                <Button
                  type="button"
                  variant={hasPhoto ? 'outline' : 'default'}
                  className="h-11 w-full text-base"
                  onClick={() => inputs.current[item.id]?.click()}
                >
                  {hasPhoto ? copy.papersChange : copy.papersUpload}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {closed ? (
        <p className="text-center text-base text-muted-foreground">{alreadySent ? copy.papersDone : copy.papersClosed}</p>
      ) : (
        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={pending}>
          {pending ? chrome.saving : copy.papersSubmit}
        </Button>
      )}
    </form>
  );
}

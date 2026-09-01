/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { IdPhotoError, readPaperPhoto } from '../lib/id-photo';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import type { SolicitationClaimInput } from '../types/solicitation';

export function SolicitationClaimForm({
  onClaim,
  defaultControlNumber = '',
  idPrefix = 'claim',
  pictureLayout = false,
}: {
  onClaim: (input: SolicitationClaimInput) => Promise<unknown>;
  defaultControlNumber?: string;
  idPrefix?: string;
  pictureLayout?: boolean;
}) {
  const { locale } = useLocale();
  const copy = getSolicitationCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [controlNumber, setControlNumber] = useState(defaultControlNumber);
  const [claimantName, setClaimantName] = useState('');
  const [claimPhoto, setClaimPhoto] = useState('');
  const [claimPhotoName, setClaimPhotoName] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const photo = await readPaperPhoto(file);
      setClaimPhoto(photo.dataUrl);
      setClaimPhotoName(photo.name);
    } catch (error) {
      const code = error instanceof IdPhotoError ? error.code : '';
      toast.error(code === 'too_large' ? copy.idPhotoTooLarge : copy.idPhotoDecodeFailed);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!acknowledged || claimPhoto.length < 32) {
      toast.error(copy.claimHint);
      return;
    }
    setPending(true);
    try {
      await onClaim({
        controlNumber,
        claimantName,
        claimPhoto,
        claimPhotoName,
        acknowledged: true,
      });
      setControlNumber(defaultControlNumber);
      setClaimantName('');
      setClaimPhoto('');
      setClaimPhotoName('');
      setAcknowledged(false);
      toast.success(copy.claimed);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  const fieldClass = pictureLayout ? 'h-12 text-base' : undefined;
  const labelClass = pictureLayout ? 'text-base' : undefined;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border bg-card p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-control`}>
            {copy.controlLabel}
          </Label>
          <Input
            className={fieldClass}
            id={`${idPrefix}-control`}
            required
            value={controlNumber}
            onChange={(event) => setControlNumber(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label className={labelClass} htmlFor={`${idPrefix}-name`}>
            {copy.claimantLabel}
          </Label>
          <Input
            className={fieldClass}
            id={`${idPrefix}-name`}
            required
            value={claimantName}
            onChange={(event) => setClaimantName(event.target.value)}
          />
        </div>
      </div>
      {claimPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={claimPhoto} alt="" className="max-h-48 w-full rounded-lg object-contain" />
      ) : null}
      <input ref={fileInput} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => void onPick(event)} />
      <Button type="button" variant="outline" className={pictureLayout ? 'h-12 text-base' : undefined} onClick={() => fileInput.current?.click()}>
        {copy.claimPhotoLabel}
      </Button>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={acknowledged} onCheckedChange={(value) => setAcknowledged(value === true)} />
        {copy.acknowledgeLabel}
      </label>
      <Button type="submit" size={pictureLayout ? 'lg' : 'default'} className={pictureLayout ? 'h-12 text-base' : undefined} disabled={pending}>
        {pending ? chrome.saving : copy.claim}
      </Button>
      {pictureLayout ? null : <p className="text-sm text-muted-foreground">{copy.claimHint}</p>}
    </form>
  );
}

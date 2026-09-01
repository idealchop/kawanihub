/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Copy, ChevronRight, MapPin } from 'lucide-react';
import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { IdPhotoError, readPaperPhoto } from '../lib/id-photo';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import {
  composePersonNameFrom,
  formatBeneficiaryRelation,
  type RequirementItem,
  type Solicitation,
  type SolicitationStatus,
} from '../types/solicitation';
import { KIND_ICON } from './solicitation-kind-chip';

type CopyText = ReturnType<typeof getSolicitationCopy>;

const STATUS_PILL: Record<SolicitationStatus, string> = {
  under_review: 'text-sky-800 ring-sky-200/90',
  pending_validation: 'text-indigo-800 ring-indigo-200/90',
  rejected: 'text-rose-800 ring-rose-200/90',
  eligible: 'text-emerald-800 ring-emerald-200/90',
  ready_to_claim: 'text-teal-800 ring-teal-200/90',
  claimed: 'text-slate-700 ring-slate-200/90',
};

function formatDate(value: string, empty: string): string {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return empty;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CaseProfileIdentity({ row, copy }: { row: Solicitation; copy: CopyText }) {
  const Icon = KIND_ICON[row.kind];

  async function copyControl() {
    if (!row.controlNumber) return;
    try {
      await navigator.clipboard.writeText(row.controlNumber);
      toast.success(copy.copied);
    } catch {
      toast.error(copy.controlLabel);
    }
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_16px_rgba(15,23,42,0.06)] ring-1 ring-white/80">
        <Icon className="size-8" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-0.5">
              <p className="truncate font-mono text-2xl font-semibold tracking-wide">
                {row.controlNumber || copy.unassigned}
              </p>
              {row.controlNumber ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-current/70 hover:bg-white/60 hover:text-current"
                  aria-label={copy.copyNumber}
                  onClick={() => void copyControl()}
                >
                  <Copy className="size-3.5" />
                </Button>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm font-medium tracking-tight">{copy.kinds[row.kind]}</p>
          </div>
          <span
            className={`shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium tracking-wide shadow-sm ring-1 ${STATUS_PILL[row.status]}`}
          >
            {copy.statuses[row.status]}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 divide-x divide-black/10 border-t border-black/10 pt-3">
          <div className="pr-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] opacity-55">{copy.dateRequested}</p>
            <p className="mt-1 text-[15px] font-medium tabular-nums tracking-tight">
              {formatDate(row.createdAt, copy.unassigned)}
            </p>
          </div>
          <div className="pl-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] opacity-55">{copy.dateReceived}</p>
            <p className="mt-1 text-[15px] font-medium tabular-nums tracking-tight">
              {formatDate(row.claimedAt, copy.unassigned)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonCard({ title, name, children }: { title: string; name: string; children?: ReactNode }) {
  return (
    <div className="space-y-2 rounded-2xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="font-medium tracking-tight">{name}</p>
      {children}
    </div>
  );
}

function requesterIsTheBeneficiary(row: Solicitation): boolean {
  if (row.identity?.requesterIsBeneficiary) return true;
  if (!row.beneficiaryName) return true;
  return row.beneficiaryName === row.requesterName;
}

export function CaseRequestorCard({ row, copy }: { row: Solicitation; copy: CopyText }) {
  const identity = row.identity;
  const address = identity
    ? [identity.building, identity.street, identity.subdivision, identity.barangay].filter(Boolean).join(', ')
    : row.barangay;
  const contact = identity
    ? [identity.mobile, identity.telephone, identity.email].filter(Boolean).join(' · ')
    : row.contact;
  const samePerson = requesterIsTheBeneficiary(row);

  return (
    <PersonCard title={copy.nameLabel} name={row.requesterName}>
      {samePerson ? (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked disabled />
          {copy.sameAsBeneficiary}
        </label>
      ) : null}
      {address ? (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{address}</span>
        </p>
      ) : null}
      {contact ? <p className="text-sm text-muted-foreground">{contact}</p> : null}
      {identity?.idNumber ? (
        <p className="text-sm text-muted-foreground">
          {copy.idTypes[identity.idType]} · {identity.idNumber}
        </p>
      ) : row.idNumber ? (
        <p className="text-sm text-muted-foreground">{row.idNumber}</p>
      ) : null}
      {identity?.idPhoto || identity?.idPhotoBack ? (
        <div className="grid gap-2 pt-1 sm:grid-cols-2">
          {identity.idPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={identity.idPhoto} alt="" className="max-h-32 w-full rounded-lg object-contain bg-muted/40" />
          ) : null}
          {identity.idPhotoBack ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={identity.idPhotoBack} alt="" className="max-h-32 w-full rounded-lg object-contain bg-muted/40" />
          ) : null}
        </div>
      ) : null}
    </PersonCard>
  );
}

export function CaseBeneficiaryCard({ row, copy }: { row: Solicitation; copy: CopyText }) {
  if (requesterIsTheBeneficiary(row)) return null;

  const identity = row.identity;
  const beneficiaryName =
    identity && (identity.beneficiary.firstName || identity.beneficiary.lastName)
      ? composePersonNameFrom(identity.beneficiary)
      : row.beneficiaryName;

  if (!beneficiaryName) return null;

  const relation = formatBeneficiaryRelation(
    identity?.beneficiaryRelation,
    identity?.beneficiaryRelationOther,
    copy.beneficiaryRelations,
  );

  return (
    <PersonCard title={copy.beneficiaryLabel} name={beneficiaryName}>
      {relation ? <p className="text-sm text-muted-foreground">{copy.beneficiaryRelationLabel}: {relation}</p> : null}
    </PersonCard>
  );
}

export function CaseReasonCard({ row, copy }: { row: Solicitation; copy: CopyText }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.notesLabel}</p>
      {row.notes ? (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{row.notes}</p>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.unassigned}</p>
      )}
    </div>
  );
}

export function CaseReviewBrief({ row, copy }: { row: Solicitation; copy: CopyText }) {
  const samePerson = requesterIsTheBeneficiary(row);
  const beneficiaryName = samePerson
    ? row.requesterName
    : row.identity && (row.identity.beneficiary.firstName || row.identity.beneficiary.lastName)
      ? composePersonNameFrom(row.identity.beneficiary)
      : row.beneficiaryName || row.requesterName;
  const reason = row.notes.trim();

  return (
    <details className="group rounded-2xl border bg-card">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-start gap-2">
          <ChevronRight className="mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
          <span className="min-w-0">
            <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {copy.beneficiaryLabel}
            </span>
            <span className="mt-0.5 block font-medium tracking-tight">{beneficiaryName || copy.unassigned}</span>
            <span className="mt-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground group-open:hidden">
              {copy.notesLabel}
            </span>
            <span className="mt-0.5 block line-clamp-2 text-sm text-muted-foreground group-open:hidden">
              {reason || copy.unassigned}
            </span>
          </span>
        </span>
        <span className="shrink-0 text-sm text-muted-foreground group-open:hidden">{copy.fullDetails}</span>
      </summary>
      <div className="space-y-3 border-t px-4 py-3">
        <CaseRequestorCard row={row} copy={copy} />
        <CaseBeneficiaryCard row={row} copy={copy} />
        <CaseReasonCard row={row} copy={copy} />
      </div>
    </details>
  );
}

export function CasePaperCard({
  item,
  copy,
  editable = false,
  pending = false,
  onFulfill,
  onNote,
  onPhoto,
}: {
  item: RequirementItem;
  copy: CopyText;
  editable?: boolean;
  pending?: boolean;
  onFulfill?: (id: string, fulfilled: boolean) => void;
  onNote?: (id: string, note: string) => void;
  onPhoto?: (id: string, photo: string, photoName: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  function photoError(error: unknown): string {
    const code = error instanceof IdPhotoError ? error.code : '';
    if (code === 'type') return copy.paperPhotoBadType;
    if (code === 'too_large') return copy.paperPhotoTooLarge;
    if (code === 'decode') return copy.paperPhotoDecodeFailed;
    return error instanceof Error ? error.message : copy.paperPhotoDecodeFailed;
  }

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onPhoto) return;
    try {
      const photo = await readPaperPhoto(file);
      onPhoto(item.id, photo.dataUrl, photo.name);
    } catch (error) {
      toast.error(photoError(error));
    }
  }

  return (
    <details className="group rounded-2xl border bg-card">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-start gap-2">
          <ChevronRight className="mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-90" aria-hidden />
          <span className="min-w-0">
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              {item.photo ? copy.submitted : copy.noPaperPhoto}
            </span>
          </span>
        </span>
        <label
          className="flex shrink-0 items-center gap-2 text-sm"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={item.validated}
            disabled={!editable || pending || !onFulfill}
            onCheckedChange={(value) => onFulfill?.(item.id, value === true)}
          />
          {copy.fulfilled}
        </label>
      </summary>
      <div className="space-y-3 border-t px-4 py-3">
        {item.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo} alt="" className="max-h-40 w-full rounded-xl object-contain bg-muted/40" />
        ) : null}
        {editable && onPhoto ? (
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              disabled={pending}
              aria-label={`${item.photo ? copy.paperChange : copy.paperUpload}: ${item.label}`}
              onChange={(event) => void onPick(event)}
            />
            <Button
              type="button"
              variant={item.photo ? 'outline' : 'default'}
              className="w-full"
              disabled={pending}
              onClick={() => fileInput.current?.click()}
            >
              {item.photo ? copy.paperChange : copy.paperUpload}
            </Button>
          </>
        ) : null}
        {editable && onNote ? (
          <Textarea
            value={item.note ?? ''}
            placeholder={copy.requirementNoteHint}
            disabled={pending}
            className="min-h-16"
            aria-label={`${copy.requirementNote}: ${item.label}`}
            onChange={(event) => onNote(item.id, event.target.value)}
          />
        ) : item.note ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.note}</p>
        ) : null}
      </div>
    </details>
  );
}

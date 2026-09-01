/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { cn } from '@/lib/utils';
import type { SolicitationKind } from '../types/solicitation';
import {
  PictogramBurial,
  PictogramDaily,
  PictogramEducation,
  PictogramEvents,
  PictogramFinancial,
  PictogramMedical,
} from './public-solicit-pictograms';

export const KIND_ICON = {
  burial: PictogramBurial,
  education: PictogramEducation,
  medical: PictogramMedical,
  events: PictogramEvents,
  financial: PictogramFinancial,
  daily: PictogramDaily,
} as const;

export const KIND_HEADER: Record<SolicitationKind, string> = {
  medical: 'bg-rose-100 text-rose-950',
  burial: 'bg-slate-200 text-slate-950',
  education: 'bg-indigo-100 text-indigo-950',
  events: 'bg-amber-100 text-amber-950',
  financial: 'bg-emerald-100 text-emerald-950',
  daily: 'bg-sky-100 text-sky-950',
};

const KIND_CHIP: Record<SolicitationKind, string> = {
  medical: 'border-rose-200 bg-rose-50 text-rose-800',
  burial: 'border-slate-200 bg-slate-100 text-slate-800',
  education: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  events: 'border-amber-200 bg-amber-50 text-amber-900',
  financial: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  daily: 'border-sky-200 bg-sky-50 text-sky-800',
};

export function SolicitationKindChip({ kind, label }: { kind: SolicitationKind; label: string }) {
  const Icon = KIND_ICON[kind];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium', KIND_CHIP[kind])}>
      <Icon className="size-4 shrink-0" />
      {label}
    </span>
  );
}

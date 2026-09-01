/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import {
  ATTENTION_MARKS,
  type AttentionMark,
  type SolicitRole,
  type Solicitation,
  type SolicitationStatus,
} from '../types/solicitation';
import { canReviewSolicitation } from './solicitation-queue-row';

type CopyText = ReturnType<typeof getSolicitationCopy>;

export type FindingNextStatus = '' | 'pending_validation' | 'rejected';
export type AdminDecision = '' | 'eligible' | 'rejected';

export function defaultFindingNext(row: Solicitation, deskRole: SolicitRole): FindingNextStatus {
  if (canReviewSolicitation(row, deskRole)) return 'pending_validation';
  return '';
}

export function findingNextOptions(row: Solicitation, deskRole: SolicitRole): FindingNextStatus[] {
  const options: FindingNextStatus[] = [''];
  const canReject = (deskRole === 'admin' || deskRole === 'reviewer') && row.status === 'under_review';
  if (canReviewSolicitation(row, deskRole)) options.push('pending_validation');
  if (canReject) options.push('rejected');
  return options;
}

export function defaultAdminDecision(row: Solicitation, deskRole: SolicitRole): AdminDecision {
  if (deskRole === 'admin' && row.status === 'pending_validation') return 'eligible';
  return '';
}

export function adminDecisionEnabled(row: Solicitation, deskRole: SolicitRole): boolean {
  return deskRole === 'admin' && (row.status === 'pending_validation' || row.status === 'eligible');
}

export function adminDecisionOptions(row: Solicitation, deskRole: SolicitRole): AdminDecision[] {
  const options: AdminDecision[] = [''];
  if (deskRole !== 'admin') return options;
  if (row.status === 'pending_validation') options.push('eligible');
  const canReject =
    row.status !== 'claimed' && row.status !== 'rejected' && row.status !== 'ready_to_claim';
  if (canReject && (row.status === 'pending_validation' || row.status === 'eligible')) {
    options.push('rejected');
  }
  return options;
}

export function accountantIssueEnabled(row: Solicitation, deskRole: SolicitRole): boolean {
  return (
    (deskRole === 'admin' || deskRole === 'accountant') &&
    (row.status === 'eligible' || row.status === 'ready_to_claim')
  );
}

export function formatFundAmount(amount: number | undefined): string {
  if (!amount || amount <= 0) return '—';
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDeskWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function FindingActorLine({
  name,
  at,
  empty,
}: {
  name?: string;
  at?: string;
  empty: string;
}) {
  if (!name?.trim() && !at) {
    return <p className="text-xs text-muted-foreground">{empty}</p>;
  }
  return (
    <p className="text-xs text-muted-foreground">
      {[name?.trim(), at ? formatDeskWhen(at) : ''].filter(Boolean).join(' · ')}
    </p>
  );
}

function nextStatusLabel(copy: CopyText, status: FindingNextStatus, current: SolicitationStatus): string {
  if (!status) return `${copy.findingStatusKeep} (${copy.statuses[current]})`;
  return copy.statuses[status];
}

function adminDecisionLabel(copy: CopyText, decision: AdminDecision, current: SolicitationStatus): string {
  if (!decision) return `${copy.findingStatusKeep} (${copy.statuses[current]})`;
  return copy.statuses[decision];
}

function overallDecisionText(row: Solicitation, copy: CopyText): string {
  if (row.status === 'under_review' || row.status === 'pending_validation') {
    return copy.adminDecisionPending;
  }
  return copy.statuses[row.status];
}

export function SolicitationFinding({
  row,
  copy,
  editable,
  pending,
  findingNote,
  attentionMarks,
  nextStatus,
  nextOptions,
  onFindingNote,
  onToggleAttention,
  onNextStatus,
}: {
  row: Solicitation;
  copy: CopyText;
  editable: boolean;
  pending: boolean;
  findingNote: string;
  attentionMarks: AttentionMark[];
  nextStatus: FindingNextStatus;
  nextOptions: FindingNextStatus[];
  onFindingNote: (value: string) => void;
  onToggleAttention: (mark: AttentionMark, on: boolean) => void;
  onNextStatus: (value: FindingNextStatus) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <div>
        <p className="text-sm font-medium">{copy.findingLabel}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{copy.findingHint}</p>
        <FindingActorLine name={row.findingByName} at={row.findingAt} empty={copy.findingActorEmpty} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`finding-note-${row.id}`}>{copy.findingNoteLabel}</Label>
        <Textarea
          id={`finding-note-${row.id}`}
          value={findingNote}
          placeholder={copy.findingHint}
          disabled={!editable || pending}
          className="min-h-24"
          onChange={(event) => onFindingNote(event.target.value)}
        />
      </div>
      {editable && nextOptions.length > 1 ? (
        <div className="space-y-2">
          <Label htmlFor={`finding-status-${row.id}`}>{copy.findingStatusLabel}</Label>
          <select
            id={`finding-status-${row.id}`}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            value={nextStatus}
            disabled={pending}
            onChange={(event) => onNextStatus(event.target.value as FindingNextStatus)}
          >
            {nextOptions.map((status) => (
              <option key={status || 'keep'} value={status}>
                {nextStatusLabel(copy, status, row.status)}
              </option>
            ))}
          </select>
          {nextStatus === 'rejected' ? (
            <p className="text-sm text-destructive">{copy.rejectLockedHint}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {copy.statusLabel}: {copy.statuses[row.status]}
        </p>
      )}
      {row.status === 'rejected' ? (
        <p className="text-sm text-muted-foreground">{copy.rejectLockedHint}</p>
      ) : null}
      <div className="space-y-2">
        <p className="text-sm font-medium">{copy.attentionLabel}</p>
        <p className="text-sm text-muted-foreground">{copy.attentionHint}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {ATTENTION_MARKS.map((mark) => (
            <label key={mark} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={attentionMarks.includes(mark)}
                disabled={!editable || pending}
                onCheckedChange={(value) => onToggleAttention(mark, value === true)}
              />
              {copy.attentionMarks[mark]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SolicitationAccountantIssue({
  row,
  copy,
  editable,
  pending,
  accountantNote,
  fundAmount,
  onAccountantNote,
  onFundAmount,
}: {
  row: Solicitation;
  copy: CopyText;
  editable: boolean;
  pending: boolean;
  accountantNote: string;
  fundAmount: number;
  onAccountantNote: (value: string) => void;
  onFundAmount: (value: number) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <div>
        <p className="text-sm font-medium">{copy.accountantIssueLabel}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{copy.accountantIssueHint}</p>
        <FindingActorLine name={row.accountantByName} at={row.accountantAt} empty={copy.findingActorEmpty} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`fund-amount-${row.id}`}>{copy.fundAmountLabel}</Label>
        <Input
          id={`fund-amount-${row.id}`}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={fundAmount || ''}
          placeholder="0.00"
          disabled={!editable || pending}
          onChange={(event) => {
            const next = Number(event.target.value);
            onFundAmount(Number.isFinite(next) ? Math.max(0, next) : 0);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`accountant-note-${row.id}`}>{copy.accountantNoteLabel}</Label>
        <Textarea
          id={`accountant-note-${row.id}`}
          value={accountantNote}
          placeholder={copy.accountantIssueHint}
          disabled={!editable || pending}
          className="min-h-24"
          onChange={(event) => onAccountantNote(event.target.value)}
        />
      </div>
      {!editable ? <p className="text-sm text-muted-foreground">{copy.accountantIssueLocked}</p> : null}
    </div>
  );
}

export function SolicitationAdminFinding({
  row,
  copy,
  editable,
  pending,
  adminFindingNote,
  decision,
  decisionEnabled,
  decisionOptions,
  onAdminFindingNote,
  onDecision,
}: {
  row: Solicitation;
  copy: CopyText;
  editable: boolean;
  pending: boolean;
  adminFindingNote: string;
  decision: AdminDecision;
  decisionEnabled: boolean;
  decisionOptions: AdminDecision[];
  onAdminFindingNote: (value: string) => void;
  onDecision: (value: AdminDecision) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <div>
        <p className="text-sm font-medium">{copy.adminFindingLabel}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{copy.adminFindingHint}</p>
        <FindingActorLine name={row.adminFindingByName} at={row.adminFindingAt} empty={copy.findingActorEmpty} />
      </div>
      {editable ? (
        <div className="space-y-2">
          <Label htmlFor={`admin-decision-${row.id}`}>{copy.adminDecisionLabel}</Label>
          <select
            id={`admin-decision-${row.id}`}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            value={decisionEnabled ? decision : ''}
            disabled={pending || !decisionEnabled}
            onChange={(event) => onDecision(event.target.value as AdminDecision)}
          >
            {decisionOptions.map((option) => (
              <option key={option || 'keep'} value={option}>
                {adminDecisionLabel(copy, option, row.status)}
              </option>
            ))}
          </select>
          {!decisionEnabled && row.status === 'under_review' ? (
            <p className="text-sm text-muted-foreground">{copy.adminDecisionLocked}</p>
          ) : null}
          {decisionEnabled && decision === 'rejected' ? (
            <p className="text-sm text-destructive">{copy.rejectLockedHint}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {copy.adminDecisionLabel}: {overallDecisionText(row, copy)}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor={`admin-finding-note-${row.id}`}>{copy.adminFindingNoteLabel}</Label>
        <Textarea
          id={`admin-finding-note-${row.id}`}
          value={adminFindingNote}
          placeholder={copy.adminFindingHint}
          disabled={!editable || pending}
          className="min-h-24"
          onChange={(event) => onAdminFindingNote(event.target.value)}
        />
      </div>
      {row.status === 'rejected' ? (
        <p className="text-sm text-muted-foreground">{copy.rejectLockedHint}</p>
      ) : null}
    </div>
  );
}

export function CaseFindingCard({ row, copy }: { row: Solicitation; copy: CopyText }) {
  const marks = row.attentionMarks ?? [];
  const note = row.findingNote?.trim() ?? '';
  if (!note && marks.length === 0 && !row.findingByName) return null;

  return (
    <div className="space-y-2 rounded-2xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.findingLabel}</p>
      <FindingActorLine name={row.findingByName} at={row.findingAt} empty={copy.findingActorEmpty} />
      {marks.length ? (
        <p className="text-sm text-muted-foreground">{marks.map((mark) => copy.attentionMarks[mark]).join(' · ')}</p>
      ) : null}
      {note ? <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note}</p> : null}
      {row.status === 'rejected' ? (
        <p className="text-sm text-muted-foreground">{copy.rejectLockedHint}</p>
      ) : null}
    </div>
  );
}

export function CaseAccountantIssueCard({ row, copy }: { row: Solicitation; copy: CopyText }) {
  const note = row.accountantNote?.trim() ?? '';
  const amount = row.fundAmount ?? 0;
  if (!note && amount <= 0 && !row.accountantByName) return null;

  return (
    <div className="space-y-2 rounded-2xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.accountantIssueLabel}</p>
      <FindingActorLine name={row.accountantByName} at={row.accountantAt} empty={copy.findingActorEmpty} />
      <p className="text-sm text-muted-foreground">
        {copy.fundAmountLabel}: {formatFundAmount(amount)}
      </p>
      {note ? <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function CaseAdminFindingCard({ row, copy }: { row: Solicitation; copy: CopyText }) {
  const note = row.adminFindingNote?.trim() ?? '';
  const decided =
    row.status === 'eligible' ||
    row.status === 'rejected' ||
    row.status === 'ready_to_claim' ||
    row.status === 'claimed';
  if (!note && !decided && !row.adminFindingByName) return null;

  return (
    <div className="space-y-2 rounded-2xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.adminFindingLabel}</p>
      <FindingActorLine name={row.adminFindingByName} at={row.adminFindingAt} empty={copy.findingActorEmpty} />
      <p className="text-sm text-muted-foreground">
        {copy.adminDecisionLabel}: {overallDecisionText(row, copy)}
      </p>
      {note ? <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

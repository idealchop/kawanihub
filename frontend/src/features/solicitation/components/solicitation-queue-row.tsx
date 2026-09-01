/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { ClipboardCheck, Eye, MoreHorizontal, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatOpenDuration, formatRequestedDate, openUntilIso } from '../lib/format-open-age';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import type { Member } from '@/features/users/types/member';
import type { SolicitRole, Solicitation } from '../types/solicitation';
import { KIND_HEADER, KIND_ICON } from './solicitation-kind-chip';

type Copy = ReturnType<typeof getSolicitationCopy>;

export function QueueFlags({
  row,
  copy,
  align = 'start',
}: {
  row: Solicitation;
  copy: Copy;
  align?: 'start' | 'end';
}) {
  const flags: { label: string; alert?: boolean }[] = [];
  if (row.flags.some((flag) => flag.type === 'cooldown') || row.cooldownBlocked) {
    flags.push({ label: copy.cooldownShort, alert: true });
  }
  if (row.flags.some((flag) => flag.type === 'relative')) {
    flags.push({ label: copy.relativeFlag });
  }
  if (row.flags.some((flag) => flag.type.startsWith('suspicious_'))) {
    flags.push({ label: copy.suspiciousFlag, alert: true });
  }
  if (row.expedited) {
    flags.push({ label: copy.expedite });
  }
  for (const mark of row.attentionMarks ?? []) {
    flags.push({ label: copy.attentionMarks[mark] });
  }
  if (flags.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-0.5', align === 'end' ? 'items-end' : 'items-start')}>
      {flags.map((flag) => (
        <span
          key={flag.label}
          className={cn('text-xs', flag.alert ? 'font-medium text-destructive' : 'text-muted-foreground')}
        >
          {flag.label}
        </span>
      ))}
    </div>
  );
}

export function SolicitationDetailsCell({ row, copy }: { row: Solicitation; copy: Copy }) {
  const otherBeneficiary =
    row.beneficiaryName && row.beneficiaryName.trim() && row.beneficiaryName !== row.requesterName
      ? row.beneficiaryName
      : '';
  const KindIcon = KIND_ICON[row.kind];
  const meta = [copy.kinds[row.kind], row.barangay || '', row.controlNumber || ''].filter(Boolean).join(' · ');
  const requested = formatRequestedDate(row.createdAt);
  const open = formatOpenDuration(row.createdAt, openUntilIso(row));
  const openLabel = open
    ? open.unit === 'minute'
      ? copy.openForMinute(open.value)
      : open.unit === 'hour'
        ? copy.openForHour(open.value)
        : copy.openForDay(open.value)
    : '';
  const timing = [requested, openLabel].filter(Boolean).join(' · ');

  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl',
          KIND_HEADER[row.kind],
        )}
      >
        <KindIcon className="size-5" />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium tracking-tight">{row.requesterName}</p>
        {otherBeneficiary ? (
          <p className="text-sm text-muted-foreground">
            {copy.forBeneficiary} {otherBeneficiary}
          </p>
        ) : null}
        <p className="truncate text-sm text-muted-foreground">{meta}</p>
        {timing ? <p className="truncate text-sm text-muted-foreground">{timing}</p> : null}
      </div>
    </div>
  );
}

function assignChoices(members: Member[], currentUid: string, currentName: string) {
  const active = members.filter((member) => member.status === 'active');
  if (currentUid && !active.some((member) => member.uid === currentUid)) {
    return [{ uid: currentUid, displayName: currentName || currentUid }, ...active];
  }
  return active;
}

export function SolicitationAssignCell({
  row,
  copy,
  members,
  canEdit,
  pending,
  role,
  onAssign,
}: {
  row: Solicitation;
  copy: Copy;
  members: Member[];
  canEdit: boolean;
  pending?: boolean;
  role: 'reviewer' | 'accountant';
  onAssign?: (input: { reviewerUid: string; accountantUid: string }) => void;
}) {
  const uid = role === 'reviewer' ? row.assignedReviewerUid : row.assignedAccountantUid;
  const name = role === 'reviewer' ? row.assignedReviewerName : row.assignedAccountantName;
  const label = role === 'reviewer' ? copy.reviewerLabel : copy.accountantLabel;

  if (!canEdit || !onAssign) {
    return <p className="text-sm">{name || copy.unassigned}</p>;
  }

  const people = assignChoices(members, uid, name);
  const selectClass =
    'h-8 w-full min-w-32 max-w-44 rounded-md border border-input bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
      <label className="sr-only" htmlFor={`assign-${role}-${row.id}`}>
        {label}
      </label>
      <select
        id={`assign-${role}-${row.id}`}
        className={cn(selectClass, role === 'accountant' ? 'text-muted-foreground' : undefined)}
        value={uid}
        disabled={pending}
        onChange={(event) => {
          const nextUid = event.target.value;
          if (nextUid === uid) return;
          if (role === 'reviewer') {
            onAssign({ reviewerUid: nextUid, accountantUid: row.assignedAccountantUid });
            return;
          }
          onAssign({ reviewerUid: row.assignedReviewerUid, accountantUid: nextUid });
        }}
      >
        <option value="">{copy.unassigned}</option>
        {people.map((member) => (
          <option key={member.uid} value={member.uid}>
            {member.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SolicitationStatusCell({ row, copy }: { row: Solicitation; copy: Copy }) {
  return (
    <div className="space-y-1">
      <p className="text-sm">{copy.nextActions[row.status]}</p>
      <QueueFlags row={row} copy={copy} />
    </div>
  );
}

export function canReviewSolicitation(row: Solicitation, deskRole: SolicitRole): boolean {
  const isReviewer = deskRole === 'admin' || deskRole === 'reviewer';
  return isReviewer && row.status === 'under_review' && !row.cooldownBlocked;
}

export function canValidateSolicitation(row: Solicitation, deskRole: SolicitRole): boolean {
  return deskRole === 'admin' && row.status === 'pending_validation' && !row.cooldownBlocked;
}

export function canMarkReadyToClaim(row: Solicitation, deskRole: SolicitRole): boolean {
  return (
    (deskRole === 'admin' || deskRole === 'accountant') &&
    row.status === 'eligible' &&
    Boolean(row.controlNumber)
  );
}

export function canOpenReviewDialog(row: Solicitation, deskRole: SolicitRole): boolean {
  if (row.status === 'claimed') return false;
  if (row.status === 'pending_validation' || row.status === 'rejected') {
    return deskRole === 'admin';
  }
  if (row.status === 'eligible' || row.status === 'ready_to_claim') {
    return deskRole === 'admin' || deskRole === 'accountant';
  }
  return deskRole === 'admin' || deskRole === 'reviewer';
}

export function reviewActionLabel(row: Solicitation, deskRole: SolicitRole, copy: Copy): string {
  if (deskRole === 'admin' && row.status === 'pending_validation') return copy.validate;
  if (deskRole === 'accountant') return copy.accountantIssueLabel;
  return copy.review;
}

export function SolicitationActionCell({
  row,
  copy,
  deskRole,
  onViewDetails,
  onReview,
  onLogs,
}: {
  row: Solicitation;
  copy: Copy;
  deskRole: SolicitRole;
  onViewDetails: () => void;
  onReview: () => void;
  onLogs: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          aria-label={`${copy.actionLabel}: ${row.requesterName}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="gap-2" onSelect={onViewDetails}>
          <Eye className="size-4" />
          {copy.viewDetails}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" disabled={!canOpenReviewDialog(row, deskRole)} onSelect={onReview}>
          <ClipboardCheck className="size-4" />
          {reviewActionLabel(row, deskRole, copy)}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2" onSelect={onLogs}>
          <ScrollText className="size-4" />
          {copy.logsLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SolicitationQueueRow({
  row,
  copy,
  deskRole,
  members,
  assignPending,
  onViewDetails,
  onReview,
  onLogs,
  onAssign,
}: {
  row: Solicitation;
  copy: Copy;
  deskRole: SolicitRole;
  members: Member[];
  assignPending?: boolean;
  onViewDetails: () => void;
  onReview: () => void;
  onLogs: () => void;
  onAssign: (input: { reviewerUid: string; accountantUid: string }) => void;
}) {
  return (
    <div className="flex w-full items-start gap-3 rounded-2xl border bg-card px-4 py-4 sm:px-5">
      <div className="min-w-0 flex-1 space-y-2">
        <button
          type="button"
          onClick={onViewDetails}
          aria-label={`${copy.viewDetails}: ${row.requesterName}`}
          className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <SolicitationDetailsCell row={row} copy={copy} />
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{copy.reviewerLabel}</p>
            <SolicitationAssignCell
              row={row}
              copy={copy}
              members={members}
              canEdit={deskRole === 'admin'}
              pending={assignPending}
              role="reviewer"
              onAssign={onAssign}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{copy.accountantLabel}</p>
            <SolicitationAssignCell
              row={row}
              copy={copy}
              members={members}
              canEdit={deskRole === 'admin'}
              pending={assignPending}
              role="accountant"
              onAssign={onAssign}
            />
          </div>
        </div>
        <SolicitationStatusCell row={row} copy={copy} />
      </div>
      <SolicitationActionCell
        row={row}
        copy={copy}
        deskRole={deskRole}
        onViewDetails={onViewDetails}
        onReview={onReview}
        onLogs={onLogs}
      />
    </div>
  );
}

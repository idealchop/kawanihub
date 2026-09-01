/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import type { Member } from '@/features/users/types/member';

type Copy = ReturnType<typeof getSolicitationCopy>;

export function SolicitationDeskTools({
  copy,
  members,
  pending,
  reviewerUid,
  accountantUid,
  missingNote,
  extraLabel,
  escalateNote,
  rejectReason,
  isAdmin,
  canReviewRole,
  onReviewerUid,
  onAccountantUid,
  onMissingNote,
  onExtraLabel,
  onEscalateNote,
  onRejectReason,
  onAssign,
  onMissing,
  onEscalate,
  onExpedite,
  onFlag,
}: {
  copy: Copy;
  members: Member[];
  pending: boolean;
  reviewerUid: string;
  accountantUid: string;
  missingNote: string;
  extraLabel: string;
  escalateNote: string;
  rejectReason: string;
  isAdmin: boolean;
  canReviewRole: boolean;
  onReviewerUid: (value: string) => void;
  onAccountantUid: (value: string) => void;
  onMissingNote: (value: string) => void;
  onExtraLabel: (value: string) => void;
  onEscalateNote: (value: string) => void;
  onRejectReason: (value: string) => void;
  onAssign: () => void;
  onMissing: () => void;
  onEscalate: () => void;
  onExpedite: () => void;
  onFlag: (type: 'suspicious_request' | 'suspicious_requester' | 'suspicious_beneficiary') => void;
}) {
  if (!isAdmin && !canReviewRole) return null;

  return (
    <div className="space-y-3 rounded-2xl border bg-card p-4">
      <p className="text-sm font-medium">{copy.deskToolsLabel}</p>
      {isAdmin ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-sm">
            {copy.reviewerLabel}
            <select
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
              value={reviewerUid}
              onChange={(event) => onReviewerUid(event.target.value)}
            >
              <option value="">—</option>
              {members.map((member) => (
                <option key={member.id} value={member.uid}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {copy.accountantLabel}
            <select
              className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
              value={accountantUid}
              onChange={(event) => onAccountantUid(event.target.value)}
            >
              <option value="">—</option>
              {members.map((member) => (
                <option key={member.id} value={member.uid}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </label>
          <Button variant="outline" className="sm:col-span-2" disabled={pending} onClick={onAssign}>
            {copy.assignSave}
          </Button>
        </div>
      ) : null}
      {canReviewRole ? (
        <div className="grid gap-2">
          <Input placeholder={copy.missingNoteLabel} value={missingNote} onChange={(event) => onMissingNote(event.target.value)} />
          <Input placeholder={copy.extraPaperLabel} value={extraLabel} onChange={(event) => onExtraLabel(event.target.value)} />
          <Button variant="outline" disabled={pending || missingNote.trim().length < 4} onClick={onMissing}>
            {copy.missingLabel}
          </Button>
          <Input placeholder={copy.escalateNoteLabel} value={escalateNote} onChange={(event) => onEscalateNote(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={pending || escalateNote.trim().length < 4} onClick={onEscalate}>
              {copy.escalateLabel}
            </Button>
            <Button variant="outline" disabled={pending} onClick={onExpedite}>
              {copy.expedite}
            </Button>
          </div>
          <Input placeholder={copy.rejectReasonLabel} value={rejectReason} onChange={(event) => onRejectReason(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={pending} onClick={() => onFlag('suspicious_request')}>
              {copy.flagRequest}
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => onFlag('suspicious_requester')}>
              {copy.flagRequester}
            </Button>
            <Button variant="outline" disabled={pending} onClick={() => onFlag('suspicious_beneficiary')}>
              {copy.flagBeneficiary}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

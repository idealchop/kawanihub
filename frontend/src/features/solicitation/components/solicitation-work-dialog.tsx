/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { listActivity } from '@/features/activity/services/activity-api';
import type { ActivityLog } from '@/features/activity/types/activity';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import { CaseBeneficiaryCard, CasePaperCard, CaseProfileIdentity, CaseReasonCard, CaseRequestorCard, CaseReviewBrief } from './solicitation-case-profile';
import { SolicitationDueDiligence } from './solicitation-due-diligence';
import {
  CaseAccountantIssueCard,
  CaseAdminFindingCard,
  CaseFindingCard,
  accountantIssueEnabled,
  adminDecisionEnabled,
  adminDecisionOptions,
  defaultAdminDecision,
  defaultFindingNext,
  findingNextOptions,
  SolicitationAccountantIssue,
  SolicitationAdminFinding,
  SolicitationFinding,
  type AdminDecision,
  type FindingNextStatus,
} from './solicitation-finding';
import { KIND_HEADER } from './solicitation-kind-chip';
import { canMarkReadyToClaim, canOpenReviewDialog, canReviewSolicitation, canValidateSolicitation, reviewActionLabel } from './solicitation-queue-row';
import type {
  AttentionMark,
  RelativeRelation,
  RequirementItem,
  SolicitRole,
  Solicitation,
  SolicitationWriteInput,
} from '../types/solicitation';
import { toSolicitationWrite } from '../types/solicitation';

export type CasePane = 'details' | 'logs' | 'review';

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function SolicitationWorkDialog({
  row,
  open,
  onOpenChange,
  deskRole,
  onReview,
  onUpdate,
  onApprove,
  onMarkReady,
  onReject,
  onViewCase,
  initialPane = 'details',
}: {
  row: Solicitation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deskRole: SolicitRole;
  onReview: (id: string) => Promise<unknown>;
  onUpdate: (id: string, input: SolicitationWriteInput) => Promise<unknown>;
  onApprove: (id: string, override?: boolean) => Promise<unknown>;
  onMarkReady: (id: string) => Promise<unknown>;
  onReject: (id: string, reason: string) => Promise<unknown>;
  onViewCase?: (id: string) => void;
  initialPane?: CasePane;
}) {
  const { locale } = useLocale();
  const copy = getSolicitationCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [pending, setPending] = useState(false);
  const [showingLogs, setShowingLogs] = useState(false);
  const [showingReview, setShowingReview] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [findingNote, setFindingNote] = useState('');
  const [attentionMarks, setAttentionMarks] = useState<AttentionMark[]>([]);
  const [adminFindingNote, setAdminFindingNote] = useState('');
  const [accountantNote, setAccountantNote] = useState('');
  const [fundAmount, setFundAmount] = useState(0);
  const [nextStatus, setNextStatus] = useState<FindingNextStatus>('');
  const [adminDecision, setAdminDecision] = useState<AdminDecision>('');
  const [confirmingReject, setConfirmingReject] = useState(false);

  useEffect(() => {
    setShowingLogs(initialPane === 'logs');
    setShowingReview(initialPane === 'review');
    setLogs([]);
  }, [initialPane, row?.id]);

  useEffect(() => {
    setRequirements((row?.requirements ?? []).map((item) => ({ ...item, note: item.note ?? '' })));
    setFindingNote(row?.findingNote ?? '');
    setAttentionMarks(row?.attentionMarks ?? []);
    setAdminFindingNote(row?.adminFindingNote ?? '');
    setAccountantNote(row?.accountantNote ?? '');
    setFundAmount(row?.fundAmount ?? 0);
    setNextStatus(row && deskRole ? defaultFindingNext(row, deskRole) : '');
    setAdminDecision(row && deskRole ? defaultAdminDecision(row, deskRole) : '');
    setConfirmingReject(false);
  }, [deskRole, row?.id]);

  useEffect(() => {
    setConfirmingReject(false);
  }, [adminDecision, nextStatus]);

  useEffect(() => {
    if (!row || !showingLogs) return;
    let cancelled = false;
    setLogsLoading(true);
    void listActivity()
      .then((all) => {
        if (cancelled) return;
        setLogs(all.filter((log) => log.resource === 'solicitations' && log.resourceId === row.id));
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(error instanceof Error ? error.message : chrome.saveFailed);
        setLogs([]);
      })
      .finally(() => {
        if (!cancelled) setLogsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chrome.saveFailed, row, showingLogs]);

  if (!row) return null;

  const isAdmin = deskRole === 'admin';
  const isReviewer = deskRole === 'admin' || deskRole === 'reviewer';
  const canOpenReview = canOpenReviewDialog(row, deskRole);
  const canMarkComplete = canReviewSolicitation(row, deskRole);
  const canValidate = canValidateSolicitation(row, deskRole);
  const canMarkReady = canMarkReadyToClaim(row, deskRole);
  const canOverride = isAdmin && row.status === 'pending_validation' && row.cooldownBlocked;
  const canReject =
    isReviewer &&
    row.status !== 'claimed' &&
    row.status !== 'rejected' &&
    row.status !== 'ready_to_claim';
  const papersEditable = (isReviewer && row.status === 'under_review') || (isAdmin && row.status === 'pending_validation');
  const reviewerFindingEditable =
    isAdmin
      ? row.status !== 'claimed'
      : isReviewer && row.status === 'under_review';
  const adminFindingEditable = isAdmin && row.status !== 'claimed';
  const accountantIssueEditable = accountantIssueEnabled(row, deskRole);
  const canDecide = adminDecisionEnabled(row, deskRole);
  const rejectFromReviewer = nextStatus === 'rejected' && canReject && row.status === 'under_review';
  const rejectFromAdmin = adminDecision === 'rejected' && canReject && isAdmin && row.status !== 'under_review';
  const rejectNote = rejectFromAdmin ? adminFindingNote : findingNote;
  const rejectNoteNeeded = rejectFromAdmin ? copy.adminFindingNoteNeeded : copy.findingNoteNeeded;

  function toggleFulfilled(id: string, fulfilled: boolean) {
    setRequirements((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return { ...item, validated: fulfilled, submitted: fulfilled ? true : item.submitted };
      }),
    );
  }

  function setRequirementNote(id: string, note: string) {
    setRequirements((current) => current.map((item) => (item.id === id ? { ...item, note } : item)));
  }

  function attachPaperPhoto(id: string, photo: string, photoName: string) {
    setRequirements((current) =>
      current.map((item) => (item.id === id ? { ...item, photo, photoName, submitted: true } : item)),
    );
  }

  function toggleAttention(mark: AttentionMark, on: boolean) {
    setAttentionMarks((current) => {
      if (on) return current.includes(mark) ? current : [...current, mark];
      return current.filter((item) => item !== mark);
    });
  }

  function writePayload(): SolicitationWriteInput {
    return {
      ...toSolicitationWrite(row),
      requirements,
      findingNote,
      attentionMarks,
      adminFindingNote,
      accountantNote,
      fundAmount,
    };
  }

  async function run(action: () => Promise<unknown>, success: string) {
    setPending(true);
    try {
      await action();
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
    } finally {
      setPending(false);
    }
  }

  const papers = showingReview ? requirements : (row.requirements ?? []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl shadow-2xl">
        <DialogHeader className={cn('border-black/5 py-5', KIND_HEADER[row.kind])}>
          <DialogTitle className="sr-only">{row.controlNumber || row.requesterName}</DialogTitle>
          <DialogDescription className="sr-only">
            {copy.kinds[row.kind]}
            {row.requesterName ? ` · ${row.requesterName}` : ''}
          </DialogDescription>
          <CaseProfileIdentity row={row} copy={copy} />
        </DialogHeader>
        <DialogBody>
          {showingLogs ? (
            logsLoading ? (
              <p className="text-sm text-muted-foreground">{chrome.loading}</p>
            ) : logs.length ? (
              <ul className="space-y-2">
                {logs.map((log) => (
                  <li key={log.id} className="rounded-2xl border bg-card px-4 py-3 text-sm">
                    <p className="font-medium">{log.action}</p>
                    <p className="text-muted-foreground">
                      {log.actorName || log.actorUid}
                      {log.detail ? ` · ${log.detail}` : ''}
                    </p>
                    <p className="text-muted-foreground">{formatWhen(log.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{copy.logsEmpty}</p>
            )
          ) : showingReview ? (
            <div className="space-y-4">
              <CaseReviewBrief row={row} copy={copy} />
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{copy.requirementsLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      {papers.filter((item) => item.validated).length}/{papers.length} {copy.fulfilled}
                    </p>
                  </div>
                  {papersEditable ? <p className="text-sm text-muted-foreground">{copy.requirementsHint}</p> : null}
                </div>
                {papers.map((item) => (
                  <CasePaperCard
                    key={item.id}
                    item={item}
                    copy={copy}
                    editable={papersEditable}
                    pending={pending}
                    onFulfill={toggleFulfilled}
                    onNote={setRequirementNote}
                    onPhoto={attachPaperPhoto}
                  />
                ))}
              </div>
              <SolicitationDueDiligence
                row={row}
                copy={copy}
                pending={pending}
                canTag={isReviewer && row.status !== 'claimed' && row.status !== 'rejected' && row.status !== 'ready_to_claim'}
                onViewDetails={onViewCase}
                onTagRelative={(name: string, relation: RelativeRelation) =>
                  run(
                    () =>
                      onUpdate(row.id, {
                        ...writePayload(),
                        relatives: [...row.relatives, { name, relation }],
                      }),
                    copy.relativeTagged,
                  )
                }
              />
              <SolicitationFinding
                row={row}
                copy={copy}
                editable={reviewerFindingEditable}
                pending={pending}
                findingNote={findingNote}
                attentionMarks={attentionMarks}
                nextStatus={nextStatus}
                nextOptions={findingNextOptions(row, deskRole)}
                onFindingNote={setFindingNote}
                onToggleAttention={toggleAttention}
                onNextStatus={setNextStatus}
              />
              <SolicitationAccountantIssue
                row={row}
                copy={copy}
                editable={accountantIssueEditable}
                pending={pending}
                accountantNote={accountantNote}
                fundAmount={fundAmount}
                onAccountantNote={setAccountantNote}
                onFundAmount={setFundAmount}
              />
              <SolicitationAdminFinding
                row={row}
                copy={copy}
                editable={adminFindingEditable}
                pending={pending}
                adminFindingNote={adminFindingNote}
                decision={adminDecision}
                decisionEnabled={canDecide}
                decisionOptions={adminDecisionOptions(row, deskRole)}
                onAdminFindingNote={setAdminFindingNote}
                onDecision={setAdminDecision}
              />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <section className="space-y-3">
                <CaseRequestorCard row={row} copy={copy} />
                <CaseBeneficiaryCard row={row} copy={copy} />
                <CaseReasonCard row={row} copy={copy} />
                <CaseFindingCard row={row} copy={copy} />
                <CaseAccountantIssueCard row={row} copy={copy} />
                <CaseAdminFindingCard row={row} copy={copy} />
              </section>
              <aside className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {copy.requirementsLabel}
                  </p>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {(row.requirements ?? []).filter((item) => item.validated).length}/
                    {(row.requirements ?? []).length} {copy.fulfilled}
                  </p>
                </div>
                {(row.requirements ?? []).map((item) => (
                  <CasePaperCard key={item.id} item={item} copy={copy} />
                ))}
                {row.claimPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.claimPhoto} alt="" className="max-h-48 w-full rounded-xl object-contain" />
                ) : null}
              </aside>
            </div>
          )}
        </DialogBody>
        <DialogFooter className={showingReview ? 'sm:justify-between' : undefined}>
          {showingReview ? (
            <>
              <span />
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => setShowingReview(false)}>
                  {copy.viewDetails}
                </Button>
                {papersEditable || reviewerFindingEditable || adminFindingEditable || accountantIssueEditable ? (
                  <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() => void run(() => onUpdate(row.id, writePayload()), copy.findingSaved)}
                  >
                    {papersEditable ? copy.saveRequirements : copy.saveFinding}
                  </Button>
                ) : null}
                {nextStatus === 'pending_validation' && canMarkComplete ? (
                  <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      void run(async () => {
                        await onUpdate(row.id, writePayload());
                        await onReview(row.id);
                      }, copy.reviewed)
                    }
                  >
                    {copy.markComplete}
                  </Button>
                ) : null}
                {adminDecision === 'eligible' && canValidate ? (
                  <Button
                    disabled={pending}
                    onClick={() =>
                      void run(async () => {
                        await onUpdate(row.id, writePayload());
                        await onApprove(row.id);
                      }, copy.approved)
                    }
                  >
                    {copy.approve}
                  </Button>
                ) : null}
                {rejectFromReviewer || rejectFromAdmin ? (
                  confirmingReject ? (
                    <div className="flex min-w-0 flex-col gap-2 sm:max-w-sm">
                      <p className="text-sm font-medium">{copy.rejectConfirmTitle}</p>
                      <p className="text-sm text-destructive">{copy.rejectConfirmBody}</p>
                      <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Button variant="outline" disabled={pending} onClick={() => setConfirmingReject(false)}>
                          {copy.rejectConfirmCancel}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={pending || rejectNote.trim().length < 8}
                          onClick={() =>
                            void run(async () => {
                              await onUpdate(row.id, writePayload());
                              await onReject(row.id, rejectNote);
                            }, copy.rejected)
                          }
                        >
                          {copy.rejectConfirm}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={pending}
                      onClick={() => {
                        if (rejectNote.trim().length < 8) {
                          toast.error(rejectNoteNeeded);
                          return;
                        }
                        setConfirmingReject(true);
                      }}
                    >
                      {copy.reject}
                    </Button>
                  )
                ) : null}
                {canOverride ? (
                  <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      void run(async () => {
                        await onUpdate(row.id, writePayload());
                        await onApprove(row.id, true);
                      }, copy.approved)
                    }
                  >
                    {copy.override}
                  </Button>
                ) : null}
                {canMarkReady ? (
                  <Button
                    disabled={pending}
                    onClick={() => {
                      if (!(fundAmount > 0)) {
                        toast.error(copy.fundAmountNeeded);
                        return;
                      }
                      void run(async () => {
                        await onUpdate(row.id, writePayload());
                        await onMarkReady(row.id);
                      }, copy.markedReady);
                    }}
                  >
                    {copy.markReady}
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                aria-pressed={showingLogs}
                onClick={() => {
                  setShowingLogs((openLogs) => !openLogs);
                  setShowingReview(false);
                }}
              >
                {copy.logsLabel}
              </Button>
              <Button
                disabled={!canOpenReview}
                onClick={() => {
                  setShowingLogs(false);
                  setShowingReview(true);
                }}
              >
                {reviewActionLabel(row, deskRole, copy)}
              </Button>
              {canMarkReady ? (
                <Button
                  disabled={pending}
                  onClick={() => {
                    if (!(fundAmount > 0)) {
                      toast.error(copy.fundAmountNeeded);
                      return;
                    }
                    void run(async () => {
                      await onUpdate(row.id, writePayload());
                      await onMarkReady(row.id);
                    }, copy.markedReady);
                  }}
                >
                  {copy.markReady}
                </Button>
              ) : null}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

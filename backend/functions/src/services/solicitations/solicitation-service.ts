/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { memoryDb } from '../../store/memory-store';
import { HttpError } from '../../utils/errors';
import { writeAuditLog } from '../audit/audit-service';
import { findMemberByActor, listMembers } from '../members/members-service';
import { createNotification } from '../notifications/notifications-service';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import { canSolicit, resolveSolicitRole, rowVisibleTo, type SolicitAction } from './solicitation-desk';
import { buildDueDiligenceMatches } from './solicitation-due-diligence';
import {
  buildSolicitationExport,
  type SolicitationReportFile,
  type SolicitationReportFormat,
} from './solicitation-report';
import {
  evaluatePolicy,
  issueClaimCode,
  issueRequirements,
  namesMatch,
  normalizeClaimCode,
  normalizePerson,
  REQUIREMENT_CATALOG,
  requirementsComplete,
} from './solicitation-policy';
import {
  DESK_OWNER_UID,
  PUBLIC_ACTOR_UID,
  composePersonNameFrom,
  emptyDeskState,
  withDeskDefaults,
  type FirstFamilyRelative,
  type PolicyFlagType,
  type PublicSolicitation,
  type RequirementItem,
  type RequesterIdentity,
  type SolicitationKind,
  type SolicitationRecord,
  type AttentionMark,
} from './solicitation-types';

function key(workspaceId: string, solicitationId: string): string {
  return `${workspaceId}:${solicitationId}`;
}

async function readAll(workspaceId: string): Promise<SolicitationRecord[]> {
  const rows = demoMode
    ? [...memoryDb.solicitations.values()].filter((row) => row.workspaceId === workspaceId)
    : (await getAdminDb().collection('workspaces').doc(workspaceId).collection('solicitations').get()).docs.map(
        (doc) => doc.data() as SolicitationRecord,
      );
  return rows.map(withDeskDefaults);
}

async function actorDesk(workspaceId: string, actorUid: string) {
  const member = await findMemberByActor(workspaceId, actorUid);
  return { member, role: resolveSolicitRole(member), name: member?.displayName || actorUid };
}

type DeskActor = Awaited<ReturnType<typeof actorDesk>>;

function marksChanged(left: AttentionMark[] | undefined, right: AttentionMark[] | undefined): boolean {
  return [...(left ?? [])].slice().sort().join('|') !== [...(right ?? [])].slice().sort().join('|');
}

function actorStamp(desk: DeskActor, actorUid: string, at = new Date().toISOString()) {
  return { uid: desk.member?.uid || actorUid, name: desk.name, at };
}

function nextReviewerFinding(
  existing: SolicitationRecord,
  input: Pick<SolicitationWrite, 'findingNote' | 'attentionMarks'>,
  desk: DeskActor,
  actorUid: string,
  canWrite: boolean,
) {
  if (!canWrite || (input.findingNote === undefined && input.attentionMarks === undefined)) {
    return {
      findingNote: existing.findingNote,
      attentionMarks: existing.attentionMarks,
      findingByUid: existing.findingByUid,
      findingByName: existing.findingByName,
      findingAt: existing.findingAt,
    };
  }
  const findingNote = input.findingNote !== undefined ? input.findingNote.trim() : existing.findingNote;
  const attentionMarks = input.attentionMarks ?? existing.attentionMarks;
  const changed = findingNote !== existing.findingNote || marksChanged(attentionMarks, existing.attentionMarks);
  const stamp = changed ? actorStamp(desk, actorUid) : null;
  return {
    findingNote,
    attentionMarks,
    findingByUid: stamp?.uid ?? existing.findingByUid,
    findingByName: stamp?.name ?? existing.findingByName,
    findingAt: stamp?.at ?? existing.findingAt,
  };
}

function nextAdminFinding(
  existing: SolicitationRecord,
  input: Pick<SolicitationWrite, 'adminFindingNote'>,
  desk: DeskActor,
  actorUid: string,
  canWrite: boolean,
) {
  if (!canWrite || input.adminFindingNote === undefined) {
    return {
      adminFindingNote: existing.adminFindingNote,
      adminFindingByUid: existing.adminFindingByUid,
      adminFindingByName: existing.adminFindingByName,
      adminFindingAt: existing.adminFindingAt,
    };
  }
  const adminFindingNote = input.adminFindingNote.trim();
  const changed = adminFindingNote !== existing.adminFindingNote;
  const stamp = changed ? actorStamp(desk, actorUid) : null;
  return {
    adminFindingNote,
    adminFindingByUid: stamp?.uid ?? existing.adminFindingByUid,
    adminFindingByName: stamp?.name ?? existing.adminFindingByName,
    adminFindingAt: stamp?.at ?? existing.adminFindingAt,
  };
}

function nextAccountantIssue(
  existing: SolicitationRecord,
  input: Pick<SolicitationWrite, 'accountantNote' | 'fundAmount'>,
  desk: DeskActor,
  actorUid: string,
  canWrite: boolean,
) {
  if (!canWrite || (input.accountantNote === undefined && input.fundAmount === undefined)) {
    return {
      accountantNote: existing.accountantNote,
      fundAmount: existing.fundAmount,
      accountantByUid: existing.accountantByUid,
      accountantByName: existing.accountantByName,
      accountantAt: existing.accountantAt,
    };
  }
  const accountantNote = input.accountantNote !== undefined ? input.accountantNote.trim() : existing.accountantNote;
  const fundAmount =
    input.fundAmount !== undefined && Number.isFinite(input.fundAmount)
      ? Math.max(0, input.fundAmount)
      : existing.fundAmount;
  const changed = accountantNote !== existing.accountantNote || fundAmount !== existing.fundAmount;
  const stamp = changed ? actorStamp(desk, actorUid) : null;
  return {
    accountantNote,
    fundAmount,
    accountantByUid: stamp?.uid ?? existing.accountantByUid,
    accountantByName: stamp?.name ?? existing.accountantByName,
    accountantAt: stamp?.at ?? existing.accountantAt,
  };
}

async function assertSolicitAction(workspaceId: string, actorUid: string, action: SolicitAction) {
  const desk = await actorDesk(workspaceId, actorUid);
  if (!canSolicit(desk.role, action)) {
    throw new HttpError(403, 'This desk role cannot do that');
  }
  return desk;
}

async function auditSolicit(workspaceId: string, action: string, actorUid: string, resourceId: string, detail = '') {
  const desk = await actorDesk(workspaceId, actorUid);
  await writeAuditLog({
    workspaceId,
    action,
    actorUid,
    actorName: desk.name,
    detail,
    resource: 'solicitations',
    resourceId,
  });
}

async function notifySolicit(workspaceId: string, actorUid: string, title: string, body: string) {
  await createNotification(workspaceId, actorUid, { title, body, kind: 'solicitation', read: false }, { audit: false });
}

function caseRef(row: Pick<SolicitationRecord, 'controlNumber' | 'requesterName'>): string {
  return row.controlNumber || row.requesterName;
}

function afterValidation(row: SolicitationRecord): SolicitationRecord {
  if (row.status === 'under_review' && requirementsComplete(row) && row.missingNote) {
    return { ...row, missingNote: '' };
  }
  return row;
}

async function writeRow(record: SolicitationRecord): Promise<void> {
  if (demoMode) {
    memoryDb.solicitations.set(key(record.workspaceId, record.id), record);
    return;
  }
  await getAdminDb()
    .collection('workspaces')
    .doc(record.workspaceId)
    .collection('solicitations')
    .doc(record.id)
    .set(record);
}

function applyRequirementPatches(
  current: RequirementItem[],
  patches?: { id: string; submitted?: boolean; validated?: boolean; photo?: string; photoName?: string; note?: string }[],
) {
  if (!patches?.length) return current;
  return current.map((item) => {
    const patch = patches.find((entry) => entry.id === item.id);
    if (!patch) return item;
    const photo = patch.photo ?? item.photo ?? '';
    const photoName = patch.photoName ?? item.photoName ?? '';
    const note = patch.note ?? item.note ?? '';
    const submitted = patch.submitted ?? item.submitted;
    const validated = patch.validated ?? item.validated;
    const fulfilled = Boolean(validated);
    return {
      ...item,
      photo,
      photoName,
      note,
      submitted: fulfilled ? true : submitted || photo.length >= 32,
      validated: fulfilled,
    };
  });
}

function withPolicy(row: SolicitationRecord, existing: SolicitationRecord[]): SolicitationRecord {
  const { flags, cooldownBlocked } = evaluatePolicy(row, existing);
  return { ...row, flags, cooldownBlocked };
}

export function toPublicSolicitation(row: SolicitationRecord): PublicSolicitation {
  const ready = withDeskDefaults(row);
  return {
    id: ready.id,
    requesterName: ready.requesterName,
    beneficiaryName: ready.beneficiaryName ?? '',
    barangay: ready.barangay,
    kind: ready.kind,
    status: ready.status,
    controlNumber: ready.controlNumber,
    requirements: ready.requirements.map((item) => ({
      id: item.id,
      label: item.label,
      submitted: item.submitted,
      photo: item.photo ?? '',
      photoName: item.photoName ?? '',
    })),
    flags: ready.flags
      .filter((flag) => flag.type === 'cooldown' || flag.type === 'relative')
      .map((flag) => ({ type: flag.type, message: flag.message })),
    cooldownBlocked: ready.cooldownBlocked,
    rejectReason: ready.rejectReason,
    missingNote: ready.missingNote,
    reviewerFeedback: ready.reviewerFeedback,
    claimedAt: ready.claimedAt,
    acknowledged: ready.acknowledged,
  };
}

export function getRequirementCatalog() {
  return REQUIREMENT_CATALOG;
}

async function ensureDeskWorkspace(workspaceId: string): Promise<void> {
  await ensureWorkspace(workspaceId, DESK_OWNER_UID);
}

export async function createPublicSolicitation(
  workspaceId: string,
  input: SolicitationWrite,
): Promise<PublicSolicitation> {
  await ensureDeskWorkspace(workspaceId);
  const record = await createSolicitation(workspaceId, PUBLIC_ACTOR_UID, input);
  return toPublicSolicitation(record);
}

export async function getPublicSolicitation(workspaceId: string, solicitationId: string): Promise<PublicSolicitation> {
  await ensureDeskWorkspace(workspaceId);
  const record = await getSolicitation(workspaceId, solicitationId, DESK_OWNER_UID);
  return toPublicSolicitation(record);
}

export async function submitPublicRequirements(
  workspaceId: string,
  solicitationId: string,
  input: { requirements: { id: string; photo: string; photoName?: string }[] },
): Promise<PublicSolicitation> {
  await ensureDeskWorkspace(workspaceId);
  const existingRow = await getSolicitation(workspaceId, solicitationId, DESK_OWNER_UID);
  if (existingRow.status !== 'under_review') {
    throw new HttpError(400, 'Requirements can no longer be submitted');
  }
  const papersAlreadyIn =
    existingRow.requirements.length > 0 &&
    existingRow.requirements.every((item) => item.submitted && item.photo) &&
    !existingRow.missingNote;
  if (papersAlreadyIn) {
    throw new HttpError(400, 'Requirements can no longer be submitted');
  }
  const known = new Set(existingRow.requirements.map((item) => item.id));
  if (input.requirements.some((item) => !known.has(item.id))) {
    throw new HttpError(400, 'Unknown requirement');
  }
  const uploaded = new Map(input.requirements.map((item) => [item.id, item]));
  if (existingRow.requirements.some((item) => (uploaded.get(item.id)?.photo.length ?? 0) < 32)) {
    throw new HttpError(400, 'Every paper needs a photo');
  }
  const patched = applyRequirementPatches(
    existingRow.requirements,
    input.requirements.map((item) => ({
      id: item.id,
      submitted: true,
      photo: item.photo,
      photoName: item.photoName ?? '',
    })),
  );
  const record = {
    ...existingRow,
    requirements: patched,
    status: 'under_review' as const,
    missingNote: '',
    updatedAt: new Date().toISOString(),
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.requirements', PUBLIC_ACTOR_UID, solicitationId, 'Papers uploaded');
  await notifySolicit(
    workspaceId,
    DESK_OWNER_UID,
    `Papers in for ${record.requesterName}`,
    `${record.requesterName} uploaded papers. Reviewer can check them.`,
  );
  return toPublicSolicitation(record);
}

export async function trackPublicSolicitation(workspaceId: string, controlNumber: string): Promise<PublicSolicitation> {
  await ensureDeskWorkspace(workspaceId);
  const existing = await readAll(workspaceId);
  const wanted = normalizeClaimCode(controlNumber);
  if (!wanted) throw new HttpError(404, 'Control number not found');
  const row = existing.find((item) => item.controlNumber && normalizeClaimCode(item.controlNumber) === wanted);
  if (!row) throw new HttpError(404, 'Control number not found');
  return toPublicSolicitation(row);
}

export async function claimPublicSolicitation(
  workspaceId: string,
  input: { controlNumber: string; claimantName: string; claimPhoto: string; claimPhotoName?: string; acknowledged: true },
): Promise<PublicSolicitation> {
  await ensureDeskWorkspace(workspaceId);
  const record = await claimSolicitation(workspaceId, PUBLIC_ACTOR_UID, input);
  return toPublicSolicitation(record);
}

export async function listSolicitations(workspaceId: string, actorUid: string): Promise<SolicitationRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  return readAll(workspaceId);
}

export async function listVisibleSolicitations(workspaceId: string, actorUid: string): Promise<{
  solicitations: SolicitationRecord[];
  deskRole: ReturnType<typeof resolveSolicitRole>;
}> {
  const rows = await listSolicitations(workspaceId, actorUid);
  const desk = await actorDesk(workspaceId, actorUid);
  return {
    solicitations: rows.filter((row) => rowVisibleTo(desk.role, desk.member?.uid, row)),
    deskRole: desk.role,
  };
}

export async function listPersonHistory(
  workspaceId: string,
  actorUid: string,
  query: { name?: string; idNumber?: string; barangay?: string },
): Promise<SolicitationRecord[]> {
  await assertSolicitAction(workspaceId, actorUid, 'review');
  const rows = await listSolicitations(workspaceId, actorUid);
  const name = (query.name ?? '').trim();
  const idNumber = (query.idNumber ?? '').trim();
  const barangay = (query.barangay ?? '').trim();
  if (!name && !idNumber) return [];
  const person = normalizePerson(name, barangay, idNumber);
  return rows.filter((row) => {
    const requester = normalizePerson(row.requesterName, row.barangay, row.idNumber);
    const beneficiary = normalizePerson(row.beneficiaryName, row.barangay, row.idNumber);
    if (idNumber && row.idNumber && row.idNumber.trim().toLowerCase() === idNumber.toLowerCase()) return true;
    return requester === person || beneficiary === person || namesMatch(row.requesterName, name) || namesMatch(row.beneficiaryName, name);
  });
}

export async function listDueDiligence(workspaceId: string, solicitationId: string, actorUid: string) {
  await assertSolicitAction(workspaceId, actorUid, 'review');
  const current = await getSolicitation(workspaceId, solicitationId, actorUid);
  const rows = await readAll(workspaceId);
  return { matches: buildDueDiligenceMatches(current, rows) };
}

export { buildSolicitationReport } from './solicitation-report';

export async function exportSolicitationReport(
  workspaceId: string,
  actorUid: string,
  format: SolicitationReportFormat,
): Promise<SolicitationReportFile> {
  await assertSolicitAction(workspaceId, actorUid, 'report');
  const payload = await listVisibleSolicitations(workspaceId, actorUid);
  return buildSolicitationExport(payload.solicitations, format);
}

export async function getSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
): Promise<SolicitationRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const rows = await readAll(workspaceId);
  const row = rows.find((item) => item.id === solicitationId);
  if (!row) throw new HttpError(404, 'Solicitation not found');
  return row;
}

type SolicitationWrite = {
  requesterName: string;
  beneficiaryName?: string;
  barangay: string;
  contact: string;
  idNumber: string;
  identity?: RequesterIdentity;
  kind: SolicitationKind;
  notes: string;
  relatives: FirstFamilyRelative[];
  requirements?: { id: string; submitted?: boolean; validated?: boolean; photo?: string; photoName?: string; note?: string }[];
  findingNote?: string;
  attentionMarks?: AttentionMark[];
  adminFindingNote?: string;
  accountantNote?: string;
  fundAmount?: number;
};

function flattenIdentity(input: SolicitationWrite): Pick<SolicitationRecord, 'requesterName' | 'barangay' | 'contact' | 'idNumber' | 'identity'> {
  if (!input.identity) {
    return {
      requesterName: input.requesterName,
      barangay: input.barangay,
      contact: input.contact,
      idNumber: input.idNumber,
      identity: undefined,
    };
  }
  return {
    requesterName: composePersonNameFrom(input.identity),
    barangay: input.identity.barangay,
    contact: input.identity.mobile,
    idNumber: input.identity.idNumber,
    identity: input.identity,
  };
}

function resolveBeneficiaryName(input: SolicitationWrite): string {
  if (input.identity?.requesterIsBeneficiary) {
    return composePersonNameFrom(input.identity);
  }
  if (input.identity?.beneficiary) {
    const named = composePersonNameFrom(input.identity.beneficiary);
    if (named) return named;
  }
  return (input.beneficiaryName ?? '').trim();
}

export async function createSolicitation(
  workspaceId: string,
  actorUid: string,
  input: SolicitationWrite,
): Promise<SolicitationRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const now = new Date().toISOString();
  const existing = await readAll(workspaceId);
  const person = flattenIdentity(input);
  const draft: SolicitationRecord = {
    id: randomUUID(),
    workspaceId,
    ...person,
    beneficiaryName: resolveBeneficiaryName(input),
    kind: input.kind,
    notes: input.notes,
    status: 'under_review',
    requirements: issueRequirements(input.kind),
    relatives: input.relatives,
    flags: [],
    cooldownBlocked: false,
    ...emptyDeskState(),
    controlNumber: '',
    controlIssuedAt: '',
    claimedAt: '',
    claimedByName: '',
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  };
  const record = withPolicy(draft, existing);
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.create', actorUid, record.id, record.requesterName);
  await notifySolicit(
    workspaceId,
    actorUid === PUBLIC_ACTOR_UID ? DESK_OWNER_UID : actorUid,
    `New solicitation from ${record.requesterName}`,
    `${record.requesterName} · ${record.kind}. Pending for Review. Desk photographs the papers.`,
  );
  return record;
}

export async function updateSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
  input: SolicitationWrite,
): Promise<SolicitationRecord> {
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  if (existingRow.status === 'claimed') {
    throw new HttpError(400, 'This solicitation can no longer be edited');
  }
  const desk = await actorDesk(workspaceId, actorUid);
  const canWriteReviewer = desk.role === 'admin' || desk.role === 'reviewer';
  const canWriteAdmin = desk.role === 'admin';
  const canWriteAccountant =
    (desk.role === 'admin' || desk.role === 'accountant') &&
    (existingRow.status === 'eligible' || existingRow.status === 'ready_to_claim');

  if (desk.role === 'accountant') {
    if (existingRow.status !== 'eligible' && existingRow.status !== 'ready_to_claim') {
      throw new HttpError(403, 'This desk role cannot do that');
    }
    const record: SolicitationRecord = {
      ...existingRow,
      ...nextAccountantIssue(existingRow, input, desk, actorUid, true),
      updatedAt: new Date().toISOString(),
    };
    await writeRow(record);
    await auditSolicit(workspaceId, 'solicitations.update', actorUid, solicitationId);
    return record;
  }

  if (existingRow.status === 'rejected' || existingRow.status === 'ready_to_claim') {
    if (desk.role !== 'admin') {
      throw new HttpError(403, 'This desk role cannot do that');
    }
    const record: SolicitationRecord = {
      ...existingRow,
      ...nextReviewerFinding(existingRow, input, desk, actorUid, canWriteReviewer),
      ...nextAdminFinding(existingRow, input, desk, actorUid, canWriteAdmin),
      ...nextAccountantIssue(existingRow, input, desk, actorUid, canWriteAccountant),
      updatedAt: new Date().toISOString(),
    };
    await writeRow(record);
    await auditSolicit(workspaceId, 'solicitations.update', actorUid, solicitationId);
    return record;
  }

  const existing = (await readAll(workspaceId)).filter((row) => row.id !== solicitationId);
  const kindChanged = input.kind !== existingRow.kind;
  const person = flattenIdentity({
    ...input,
    identity: input.identity ?? existingRow.identity,
  });
  const record = withPolicy(
    {
      ...existingRow,
      ...person,
      beneficiaryName: resolveBeneficiaryName(input) || existingRow.beneficiaryName || '',
      kind: input.kind,
      notes: input.notes,
      relatives: input.relatives,
      requirements: kindChanged ? issueRequirements(input.kind) : applyRequirementPatches(existingRow.requirements, input.requirements),
      ...nextReviewerFinding(existingRow, input, desk, actorUid, canWriteReviewer),
      ...nextAdminFinding(existingRow, input, desk, actorUid, canWriteAdmin),
      ...nextAccountantIssue(existingRow, input, desk, actorUid, canWriteAccountant),
      updatedAt: new Date().toISOString(),
    },
    existing,
  );
  const saved = afterValidation(record);
  await writeRow(saved);
  await auditSolicit(workspaceId, 'solicitations.update', actorUid, solicitationId);
  return saved;
}

export async function submitForReview(workspaceId: string, solicitationId: string, actorUid: string): Promise<SolicitationRecord> {
  await assertSolicitAction(workspaceId, actorUid, 'review');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  if (existingRow.status !== 'under_review') {
    throw new HttpError(400, 'Only open reviews can be sent for validate');
  }
  if (!requirementsComplete(existingRow)) {
    throw new HttpError(400, 'Validate every required document before review');
  }
  if (existingRow.cooldownBlocked) {
    throw new HttpError(400, 'Blocked by the 3-month rule for this person');
  }
  const record: SolicitationRecord = {
    ...existingRow,
    status: 'pending_validation',
    updatedAt: new Date().toISOString(),
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.review', actorUid, solicitationId);
  await notifySolicit(workspaceId, actorUid, `Ready to validate ${existingRow.requesterName}`, 'Reviewer sent this case for admin validate.');
  return record;
}

export async function approveSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
  input: { override?: boolean } = {},
): Promise<SolicitationRecord> {
  const desk = await assertSolicitAction(workspaceId, actorUid, input.override ? 'override' : 'approve');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  if (existingRow.status !== 'pending_validation') {
    throw new HttpError(400, 'Only reviewed solicitations can be marked eligible');
  }
  if (!input.override && !requirementsComplete(existingRow)) {
    throw new HttpError(400, 'Requirements are not fully validated');
  }
  if (input.override && desk.role !== 'admin') {
    throw new HttpError(403, 'Only an admin can override');
  }
  if (existingRow.cooldownBlocked && !input.override) {
    throw new HttpError(400, 'Blocked by the 3-month rule for this person');
  }
  const existing = await readAll(workspaceId);
  const now = new Date().toISOString();
  const controlNumber = existingRow.controlNumber || issueClaimCode(existing);
  const adminStamp = actorStamp(desk, actorUid, now);
  const record: SolicitationRecord = {
    ...existingRow,
    status: 'eligible',
    controlNumber,
    controlIssuedAt: existingRow.controlIssuedAt || now,
    overrideUsed: Boolean(input.override),
    adminFindingByUid: adminStamp.uid,
    adminFindingByName: adminStamp.name,
    adminFindingAt: adminStamp.at,
    updatedAt: now,
  };
  await writeRow(record);
  await auditSolicit(
    workspaceId,
    input.override ? 'solicitations.override' : 'solicitations.approve',
    actorUid,
    solicitationId,
    record.controlNumber,
  );
  await notifySolicit(
    workspaceId,
    actorUid,
    `Eligible: ${record.requesterName}`,
    `Control number ${record.controlNumber}. Accountant marks Ready for Claim when funds are ready.`,
  );
  return record;
}

export async function markReadyToClaim(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
): Promise<SolicitationRecord> {
  await assertSolicitAction(workspaceId, actorUid, 'ready_to_claim');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  if (existingRow.status !== 'eligible') {
    throw new HttpError(400, 'Only eligible solicitations can be marked ready for claim');
  }
  if (!existingRow.controlNumber) {
    throw new HttpError(400, 'Issue a control number before Ready for Claim');
  }
  if (!(existingRow.fundAmount > 0)) {
    throw new HttpError(400, 'Set the amount before Ready for Claim');
  }
  const now = new Date().toISOString();
  const record: SolicitationRecord = {
    ...existingRow,
    status: 'ready_to_claim',
    updatedAt: now,
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.ready-to-claim', actorUid, solicitationId, record.controlNumber);
  await notifySolicit(
    workspaceId,
    actorUid,
    `Ready for claim ${record.controlNumber}`,
    `${record.requesterName} can claim.`,
  );
  return record;
}

export async function rejectSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
  reason: string,
): Promise<SolicitationRecord> {
  const desk = await assertSolicitAction(workspaceId, actorUid, 'reject');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  if (existingRow.status === 'claimed') {
    throw new HttpError(400, 'A claimed solicitation cannot be rejected');
  }
  const feedback = reason.trim();
  if (feedback.length < 8) {
    throw new HttpError(400, 'Reject must include feedback for the requestor');
  }
  const stamp = actorStamp(desk, actorUid);
  const fromReviewer = existingRow.status === 'under_review';
  const record: SolicitationRecord = {
    ...existingRow,
    status: 'rejected',
    rejectReason: feedback,
    reviewerFeedback: feedback,
    ...(fromReviewer
      ? { findingByUid: stamp.uid, findingByName: stamp.name, findingAt: stamp.at }
      : { adminFindingByUid: stamp.uid, adminFindingByName: stamp.name, adminFindingAt: stamp.at }),
    updatedAt: stamp.at,
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.reject', actorUid, solicitationId, feedback);
  await notifySolicit(workspaceId, actorUid, `Not eligible: ${caseRef(record)}`, feedback);
  return record;
}

export async function claimSolicitation(
  workspaceId: string,
  actorUid: string,
  input: { controlNumber: string; claimantName: string; claimPhoto: string; claimPhotoName?: string; acknowledged: true },
): Promise<SolicitationRecord> {
  if (actorUid !== PUBLIC_ACTOR_UID) {
    await assertSolicitAction(workspaceId, actorUid, 'release');
  }
  await ensureWorkspace(workspaceId, actorUid === PUBLIC_ACTOR_UID ? DESK_OWNER_UID : actorUid);
  if ((input.claimPhoto?.length ?? 0) < 32) {
    throw new HttpError(400, 'Claim needs a receive photo');
  }
  if (!input.acknowledged) {
    throw new HttpError(400, 'Claim needs an acknowledgement');
  }
  const existing = await readAll(workspaceId);
  const wanted = normalizeClaimCode(input.controlNumber);
  if (!wanted) throw new HttpError(404, 'Control number not found');
  const existingRow = existing.find((row) => row.controlNumber && normalizeClaimCode(row.controlNumber) === wanted);
  if (!existingRow) throw new HttpError(404, 'Control number not found');
  if (existingRow.status !== 'ready_to_claim') {
    throw new HttpError(400, 'This control number is not ready to claim');
  }
  if (!namesMatch(existingRow.requesterName, input.claimantName)) {
    throw new HttpError(400, 'Claimant name does not match the person who requested');
  }
  const now = new Date().toISOString();
  const record: SolicitationRecord = {
    ...existingRow,
    status: 'claimed',
    claimedAt: now,
    claimedByName: input.claimantName.trim(),
    claimPhoto: input.claimPhoto,
    claimPhotoName: input.claimPhotoName ?? '',
    acknowledged: true,
    acknowledgedAt: now,
    acknowledgedByName: input.claimantName.trim(),
    updatedAt: now,
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.claim', actorUid, existingRow.id, existingRow.controlNumber);
  await notifySolicit(workspaceId, actorUid === PUBLIC_ACTOR_UID ? DESK_OWNER_UID : actorUid, `Claimed ${record.controlNumber}`, 'Solicit received and complete.');
  return record;
}

export async function assignSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
  input: { reviewerUid?: string; accountantUid?: string },
): Promise<SolicitationRecord> {
  await assertSolicitAction(workspaceId, actorUid, 'assign');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  const members = await listMembers(workspaceId, actorUid);
  const reviewer = members.find((member) => member.uid === input.reviewerUid);
  const accountant = members.find((member) => member.uid === input.accountantUid);
  const record: SolicitationRecord = {
    ...existingRow,
    assignedReviewerUid: reviewer?.uid ?? '',
    assignedReviewerName: reviewer?.displayName ?? '',
    assignedAccountantUid: accountant?.uid ?? '',
    assignedAccountantName: accountant?.displayName ?? '',
    updatedAt: new Date().toISOString(),
  };
  await writeRow(record);
  await auditSolicit(
    workspaceId,
    'solicitations.assign',
    actorUid,
    solicitationId,
    `${record.assignedReviewerName} / ${record.assignedAccountantName}`,
  );
  if (reviewer) {
    await notifySolicit(workspaceId, actorUid, `Assigned ${caseRef(record)}`, `Reviewer: ${reviewer.displayName}`);
  }
  if (accountant) {
    await notifySolicit(workspaceId, actorUid, `Assigned ${caseRef(record)}`, `Accountant: ${accountant.displayName}`);
  }
  return record;
}

export async function requestMissingRequirements(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
  input: { note: string; extraLabel?: string },
): Promise<SolicitationRecord> {
  await assertSolicitAction(workspaceId, actorUid, 'review');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  if (existingRow.status === 'claimed' || existingRow.status === 'rejected') {
    throw new HttpError(400, 'Cannot ask for papers on a closed solicitation');
  }
  const extras = existingRow.requirements.filter((item) => item.id.startsWith('extra-')).length;
  const extraLabel = input.extraLabel?.trim();
  const requirements = extraLabel
    ? [
        ...existingRow.requirements,
        {
          id: `extra-${extras + 1}`,
          label: extraLabel,
          submitted: false,
          validated: false,
          photo: '',
          photoName: '',
          note: '',
        },
      ]
    : existingRow.requirements.map((item) => ({ ...item, validated: false }));
  const record: SolicitationRecord = {
    ...existingRow,
    status: 'under_review',
    missingNote: input.note.trim(),
    reviewerFeedback: input.note.trim(),
    requirements,
    updatedAt: new Date().toISOString(),
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.missing', actorUid, solicitationId, record.missingNote);
  await notifySolicit(workspaceId, actorUid, `Missing papers ${caseRef(record)}`, record.missingNote);
  return record;
}

export async function escalateSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
  note: string,
): Promise<SolicitationRecord> {
  await assertSolicitAction(workspaceId, actorUid, 'review');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  const record: SolicitationRecord = {
    ...existingRow,
    escalated: true,
    escalateNote: note.trim(),
    updatedAt: new Date().toISOString(),
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.escalate', actorUid, solicitationId, note.trim());
  await notifySolicit(workspaceId, actorUid, `Admin review ${caseRef(record)}`, note.trim());
  return record;
}

export async function expediteSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
): Promise<SolicitationRecord> {
  await assertSolicitAction(workspaceId, actorUid, 'review');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  const record: SolicitationRecord = {
    ...existingRow,
    expedited: true,
    updatedAt: new Date().toISOString(),
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.expedite', actorUid, solicitationId);
  return record;
}

export async function flagSolicitation(
  workspaceId: string,
  solicitationId: string,
  actorUid: string,
  input: { type: Extract<PolicyFlagType, 'suspicious_request' | 'suspicious_requester' | 'suspicious_beneficiary'>; message: string },
): Promise<SolicitationRecord> {
  await assertSolicitAction(workspaceId, actorUid, 'flag');
  const existingRow = await getSolicitation(workspaceId, solicitationId, actorUid);
  const nextFlag = { type: input.type, message: input.message.trim() };
  const flags = [...existingRow.flags.filter((flag) => flag.type !== input.type), nextFlag];
  const record: SolicitationRecord = {
    ...existingRow,
    flags,
    updatedAt: new Date().toISOString(),
  };
  await writeRow(record);
  await auditSolicit(workspaceId, 'solicitations.flag', actorUid, solicitationId, `${input.type}: ${input.message}`);
  return record;
}

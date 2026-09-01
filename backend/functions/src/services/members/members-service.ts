/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { writeAuditLog } from '../audit/audit-service';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import {
  assertAccessAssignable,
  filterMembersForActor,
  generateMemberPassword,
  memberDisplayName,
  memberManagedByActor,
  moduleAccessGranted,
  normalizeAccess,
  permissionsFromAccess,
  solicitRoleFromAccess,
} from './members-access';
import {
  defaultSolicitRole,
  normalizeMemberRecord,
  type AppModule,
  type MemberAccess,
  type MemberRecord,
  type MemberRole,
  type MemberStatus,
} from './members-types';

function memberKey(workspaceId: string, memberId: string): string {
  return `${workspaceId}:${memberId}`;
}

function storeMember(record: MemberRecord) {
  memoryDb.members.set(memberKey(record.workspaceId, record.id), record);
}

async function listAllMembers(workspaceId: string, actorUid: string): Promise<MemberRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    return [...memoryDb.members.values()]
      .filter((row) => row.workspaceId === workspaceId)
      .map((row) => normalizeMemberRecord(row));
  }
  const snap = await getAdminDb().collection('workspaces').doc(workspaceId).collection('members').get();
  return snap.docs.map((doc) => normalizeMemberRecord(doc.data() as MemberRecord));
}

export async function listMembers(workspaceId: string, actorUid: string, email?: string): Promise<MemberRecord[]> {
  const members = await listAllMembers(workspaceId, actorUid);
  const actor = members.find((row) => row.uid === actorUid || (email && row.email === email));
  return filterMembersForActor(actor, members);
}

export async function getMember(
  workspaceId: string,
  memberId: string,
  actorUid: string,
  actorEmail?: string,
): Promise<MemberRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  let record: MemberRecord;
  if (demoMode) {
    const row = memoryDb.members.get(memberKey(workspaceId, memberId));
    if (!row) throw new HttpError(404, 'Member not found');
    record = normalizeMemberRecord(row);
  } else {
    const doc = await getAdminDb().collection('workspaces').doc(workspaceId).collection('members').doc(memberId).get();
    if (!doc.exists) throw new HttpError(404, 'Member not found');
    record = normalizeMemberRecord(doc.data() as MemberRecord);
  }

  const actor = await findMemberByActor(workspaceId, actorUid, actorEmail);
  if (actor && !memberManagedByActor(actor, record)) {
    throw new HttpError(403, 'You cannot access this user');
  }
  return record;
}

export async function findMemberByActor(
  workspaceId: string,
  actorUid: string,
  email?: string,
): Promise<MemberRecord | undefined> {
  const members = await listAllMembers(workspaceId, actorUid);
  return members.find((row) => row.uid === actorUid || (email && row.email === email));
}

export function memberHasModule(member: MemberRecord | undefined, module: AppModule): boolean {
  if (!member || member.status === 'disabled') return false;
  return moduleAccessGranted(member.role, member.access, module);
}

export async function assertModuleAccess(
  workspaceId: string,
  actorUid: string,
  module: AppModule,
  email?: string,
): Promise<MemberRecord | undefined> {
  const members = await listAllMembers(workspaceId, actorUid);
  const member = members.find((row) => row.uid === actorUid || (email && row.email === email));
  if (!memberHasModule(member, module)) {
    throw new HttpError(403, 'You do not have access to this module');
  }
  return member;
}

type MemberWrite = {
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  displayName?: string;
  role: MemberRole;
  access?: MemberAccess;
  status: MemberStatus;
  uid: string;
  password?: string;
};

export type CreateMemberResult = {
  member: MemberRecord;
  temporaryPassword?: string;
};

export async function createMember(
  workspaceId: string,
  actorUid: string,
  input: MemberWrite,
  actorEmail?: string,
): Promise<CreateMemberResult> {
  await ensureWorkspace(workspaceId, actorUid);
  const actor = await findMemberByActor(workspaceId, actorUid, actorEmail);
  const now = new Date().toISOString();
  const role = input.role === 'owner' ? 'admin' : input.role;
  const access = normalizeAccess(input.access, role);
  if (actor) assertAccessAssignable(actor, access);
  const temporaryPassword = input.password || generateMemberPassword();
  const record = normalizeMemberRecord({
    id: randomUUID(),
    workspaceId,
    uid: input.uid || `member-${randomUUID()}`,
    username: input.username,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    displayName: input.displayName ?? memberDisplayName(input.firstName, input.lastName),
    role,
    access,
    solicitRole: solicitRoleFromAccess(access),
    permissions: permissionsFromAccess(access, role),
    status: input.status,
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  });

  if (demoMode) {
    storeMember(record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('members').doc(record.id).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'members.create',
    actorUid,
    resource: 'members',
    resourceId: record.id,
  });
  return { member: record, temporaryPassword };
}

export async function updateMember(
  workspaceId: string,
  memberId: string,
  actorUid: string,
  input: MemberWrite,
  actorEmail?: string,
): Promise<MemberRecord> {
  const actor = await findMemberByActor(workspaceId, actorUid, actorEmail);
  const existing = await getMember(workspaceId, memberId, actorUid, actorEmail);
  const role = existing.role === 'owner' ? 'owner' : input.role;
  const access = normalizeAccess(input.access, role);
  if (actor) assertAccessAssignable(actor, access);
  const record = normalizeMemberRecord({
    ...existing,
    username: input.username,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    displayName: input.displayName ?? memberDisplayName(input.firstName, input.lastName, existing.displayName),
    role,
    access,
    solicitRole: solicitRoleFromAccess(access),
    permissions: permissionsFromAccess(access, role),
    status: input.status,
    uid: input.uid || existing.uid,
    updatedAt: new Date().toISOString(),
  });

  if (demoMode) {
    storeMember(record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('members').doc(memberId).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'members.update',
    actorUid,
    resource: 'members',
    resourceId: memberId,
  });
  return record;
}

export async function deleteMember(workspaceId: string, memberId: string, actorUid: string, actorEmail?: string): Promise<void> {
  const existing = await getMember(workspaceId, memberId, actorUid, actorEmail);
  if (existing.role === 'owner') {
    throw new HttpError(400, 'Cannot remove the workspace owner');
  }

  if (demoMode) {
    memoryDb.members.delete(memberKey(workspaceId, memberId));
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('members').doc(memberId).delete();
  }

  await writeAuditLog({
    workspaceId,
    action: 'members.delete',
    actorUid,
    resource: 'members',
    resourceId: memberId,
  });
}

export { defaultSolicitRole };

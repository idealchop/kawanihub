/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { memberWriteSchema } from '../services/members/members-schema';
import { FULL_ADMIN_ACCESS, permissionsFromAccess } from '../services/members/members-access';
import { normalizeMemberRecord, type MemberRecord } from '../services/members/members-types';
import {
  assertModuleAccess,
  createMember,
  deleteMember,
  findMemberByActor,
  getMember,
  listMembers,
  updateMember,
} from '../services/members/members-service';
import { HttpError, sendError } from '../utils/errors';

function actor(req: Request): { uid?: string; email?: string; name?: string } {
  return { uid: req.user?.uid, email: req.user?.email, name: req.user?.name };
}

async function requireUsersAccess(req: Request): Promise<void> {
  const { uid, email } = actor(req);
  if (!uid) throw new HttpError(401, 'Unauthorized');
  await assertModuleAccess(req.params.workspaceId, uid, 'users', email);
}

export async function listMembersHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, email } = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await assertModuleAccess(req.params.workspaceId, uid, 'users', email);
    const members = await listMembers(req.params.workspaceId, uid, email);
    res.json({ members });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getCurrentMemberHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, email, name } = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const existing = await findMemberByActor(req.params.workspaceId, uid, email);
    if (existing) {
      res.json(existing);
      return;
    }
    const fallback = normalizeMemberRecord({
      id: uid,
      workspaceId: req.params.workspaceId,
      uid,
      username: 'admin',
      firstName: name?.split(' ')[0] ?? 'Admin',
      lastName: name?.split(' ').slice(1).join(' ') ?? '',
      phone: '',
      email: email ?? 'admin@kawanihub.ph',
      displayName: name ?? 'Admin',
      role: 'owner',
      access: FULL_ADMIN_ACCESS,
      permissions: permissionsFromAccess(FULL_ADMIN_ACCESS, 'owner'),
      status: 'active',
      createdBy: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    res.json(fallback);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getMemberHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, email } = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await requireUsersAccess(req);
    const member = await getMember(req.params.workspaceId, req.params.memberId, uid, email);
    res.json(member);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createMemberHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, email } = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await requireUsersAccess(req);
    const input = memberWriteSchema.parse(req.body);
    const result = await createMember(req.params.workspaceId, uid, input, email);
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateMemberHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, email } = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await requireUsersAccess(req);
    const input = memberWriteSchema.parse(req.body);
    const member = await updateMember(req.params.workspaceId, req.params.memberId, uid, input, email);
    res.json(member);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteMemberHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, email } = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await requireUsersAccess(req);
    await deleteMember(req.params.workspaceId, req.params.memberId, uid, email);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

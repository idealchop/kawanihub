/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { getAuditLog, listAuditLogs } from '../services/audit/audit-service';
import { assertModuleAccess } from '../services/members/members-service';
import { HttpError, sendError } from '../utils/errors';

function actor(req: Request): { uid?: string; email?: string } {
  return { uid: req.user?.uid, email: req.user?.email };
}

async function gate(req: Request): Promise<string> {
  const { uid, email } = actor(req);
  if (!uid) throw new HttpError(401, 'Unauthorized');
  await assertModuleAccess(req.params.workspaceId, uid, 'activity', email);
  return uid;
}

export async function listActivityHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const logs = await listAuditLogs(req.params.workspaceId, uid);
    res.json({ logs });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getActivityHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const log = await getAuditLog(req.params.workspaceId, req.params.logId, uid);
    res.json(log);
  } catch (error) {
    sendError(res, error);
  }
}

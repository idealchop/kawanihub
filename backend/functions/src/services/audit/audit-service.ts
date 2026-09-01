/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import type { AuditRecord } from './audit-types';

export async function writeAuditLog(input: Omit<AuditRecord, 'id' | 'createdAt'>): Promise<void> {
  const record: AuditRecord = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (demoMode) {
    memoryDb.auditLogs.push(record);
    return;
  }

  await getAdminDb()
    .collection('workspaces')
    .doc(input.workspaceId)
    .collection('audit_logs')
    .doc(record.id)
    .set(record);
}

export async function listAuditLogs(workspaceId: string, actorUid: string): Promise<AuditRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    return memoryDb.auditLogs
      .filter((row) => row.workspaceId === workspaceId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const snap = await getAdminDb().collection('workspaces').doc(workspaceId).collection('audit_logs').get();
  return snap.docs
    .map((doc) => doc.data() as AuditRecord)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAuditLog(workspaceId: string, logId: string, actorUid: string): Promise<AuditRecord> {
  const logs = await listAuditLogs(workspaceId, actorUid);
  const row = logs.find((log) => log.id === logId);
  if (!row) throw new HttpError(404, 'Activity log not found');
  return row;
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { writeAuditLog } from '../audit/audit-service';
import { createNotification } from '../notifications/notifications-service';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import type { DocumentKind, DocumentRecord, DocumentStatus } from './documents-types';

function documentKey(workspaceId: string, documentId: string): string {
  return `${workspaceId}:${documentId}`;
}

export async function listDocuments(workspaceId: string, actorUid: string): Promise<DocumentRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    return [...memoryDb.documents.values()].filter((row) => row.workspaceId === workspaceId);
  }

  const snap = await getAdminDb().collection('workspaces').doc(workspaceId).collection('documents').get();
  return snap.docs.map((doc) => doc.data() as DocumentRecord);
}

export async function getDocument(workspaceId: string, documentId: string, actorUid: string): Promise<DocumentRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    const row = memoryDb.documents.get(documentKey(workspaceId, documentId));
    if (!row) throw new HttpError(404, 'Document not found');
    return row;
  }

  const doc = await getAdminDb().collection('workspaces').doc(workspaceId).collection('documents').doc(documentId).get();
  if (!doc.exists) throw new HttpError(404, 'Document not found');
  return doc.data() as DocumentRecord;
}

type DocumentWrite = {
  title: string;
  referenceNo: string;
  requester: string;
  barangay: string;
  kind: DocumentKind;
  status: DocumentStatus;
  dueAt: string;
  notes: string;
};

export async function createDocument(workspaceId: string, actorUid: string, input: DocumentWrite): Promise<DocumentRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const now = new Date().toISOString();
  const record: DocumentRecord = {
    id: randomUUID(),
    workspaceId,
    ...input,
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  };

  if (demoMode) {
    memoryDb.documents.set(documentKey(workspaceId, record.id), record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('documents').doc(record.id).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'documents.create',
    actorUid,
    resource: 'documents',
    resourceId: record.id,
  });
  await createNotification(
    workspaceId,
    actorUid,
    { title: `Bagong dokumento: ${record.title}`, body: record.requester, kind: 'document', read: false },
    { audit: false },
  );
  return record;
}

export async function updateDocument(
  workspaceId: string,
  documentId: string,
  actorUid: string,
  input: DocumentWrite,
): Promise<DocumentRecord> {
  const existing = await getDocument(workspaceId, documentId, actorUid);
  const record: DocumentRecord = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (demoMode) {
    memoryDb.documents.set(documentKey(workspaceId, documentId), record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('documents').doc(documentId).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'documents.update',
    actorUid,
    resource: 'documents',
    resourceId: documentId,
  });
  return record;
}

export async function deleteDocument(workspaceId: string, documentId: string, actorUid: string): Promise<void> {
  await getDocument(workspaceId, documentId, actorUid);

  if (demoMode) {
    memoryDb.documents.delete(documentKey(workspaceId, documentId));
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('documents').doc(documentId).delete();
  }

  await writeAuditLog({
    workspaceId,
    action: 'documents.delete',
    actorUid,
    resource: 'documents',
    resourceId: documentId,
  });
}

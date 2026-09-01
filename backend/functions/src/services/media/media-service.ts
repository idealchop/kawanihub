/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { writeAuditLog } from '../audit/audit-service';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import { deletePieceActivity, recordPieceCreated, recordPieceDeleted, recordPieceUpdated } from './media-activity-service';
import { assertMediaTypeSlug } from './media-content-type-service';
import { findDemoMediaPiece, pieceKey } from './media-piece-lookup';
import {
  applyScheduledPublish,
  compareMediaQueue,
  scheduledPostDue,
  SYSTEM_MEDIA_ACTOR_UID,
  normalizeMediaPieceFields,
  normalizeMediaPieceRecord,
  type MediaPieceRecord,
  type MediaPieceWriteInput,
} from './media-types';

function sortPieces(rows: MediaPieceRecord[]): MediaPieceRecord[] {
  return [...rows].sort(compareMediaQueue);
}

async function savePiece(record: MediaPieceRecord): Promise<void> {
  if (demoMode) {
    memoryDb.mediaPieces.set(pieceKey(record.workspaceId, record.id), record);
    return;
  }
  await getAdminDb().collection('workspaces').doc(record.workspaceId).collection('media_pieces').doc(record.id).set(record);
}

async function promoteDueScheduled(row: MediaPieceRecord): Promise<MediaPieceRecord> {
  const current = asPiece(row);
  if (!scheduledPostDue(current)) return current;
  const next: MediaPieceRecord = {
    ...applyScheduledPublish(current),
    updatedAt: new Date().toISOString(),
  };
  await savePiece(next);
  await writeAuditLog({
    workspaceId: next.workspaceId,
    action: 'media.auto_publish',
    actorUid: SYSTEM_MEDIA_ACTOR_UID,
    resource: 'media_pieces',
    resourceId: next.id,
  });
  await recordPieceUpdated(next.workspaceId, next.id, SYSTEM_MEDIA_ACTOR_UID, current, next);
  return next;
}

function asPiece(row: MediaPieceRecord): MediaPieceRecord {
  return normalizeMediaPieceRecord(row);
}

export async function listMediaPieces(workspaceId: string, actorUid: string): Promise<MediaPieceRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  const rows = demoMode
    ? [...memoryDb.mediaPieces.values()].filter((row) => row.workspaceId === workspaceId)
    : (await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_pieces').get()).docs.map(
        (doc) => doc.data() as MediaPieceRecord,
      );
  const promoted = await Promise.all(rows.map((row) => promoteDueScheduled(row)));
  return sortPieces(promoted);
}

export async function getMediaPiece(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
): Promise<MediaPieceRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    const row = findDemoMediaPiece(workspaceId, pieceId);
    if (!row) throw new HttpError(404, 'Media piece not found');
    return promoteDueScheduled(row);
  }

  const doc = await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_pieces').doc(pieceId).get();
  if (!doc.exists) throw new HttpError(404, 'Media piece not found');
  return promoteDueScheduled(doc.data() as MediaPieceRecord);
}

export async function createMediaPiece(
  workspaceId: string,
  actorUid: string,
  input: MediaPieceWriteInput,
): Promise<MediaPieceRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const fields = applyScheduledPublish(normalizeMediaPieceFields(input));
  await assertMediaTypeSlug(workspaceId, fields.type);
  const now = new Date().toISOString();
  const record: MediaPieceRecord = {
    id: randomUUID(),
    workspaceId,
    ...fields,
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  };

  await savePiece(record);

  await writeAuditLog({
    workspaceId,
    action: 'media.create',
    actorUid,
    resource: 'media_pieces',
    resourceId: record.id,
  });
  await recordPieceCreated(workspaceId, record.id, actorUid, now, record.title);
  return record;
}

export async function updateMediaPiece(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  input: MediaPieceWriteInput,
): Promise<MediaPieceRecord> {
  const existing = await getMediaPiece(workspaceId, pieceId, actorUid);
  const fields = applyScheduledPublish(normalizeMediaPieceFields(input));
  await assertMediaTypeSlug(workspaceId, fields.type);
  const record: MediaPieceRecord = {
    ...existing,
    ...fields,
    updatedAt: new Date().toISOString(),
  };

  await savePiece(record);

  await writeAuditLog({
    workspaceId,
    action: 'media.update',
    actorUid,
    resource: 'media_pieces',
    resourceId: pieceId,
  });
  await recordPieceUpdated(workspaceId, pieceId, actorUid, existing, record);
  return record;
}

export async function deleteMediaPiece(workspaceId: string, pieceId: string, actorUid: string): Promise<void> {
  const existing = await getMediaPiece(workspaceId, pieceId, actorUid);

  await recordPieceDeleted(workspaceId, pieceId, actorUid, existing.title);
  await deletePieceActivity(workspaceId, pieceId);

  if (demoMode) {
    memoryDb.mediaPieces.delete(pieceKey(workspaceId, pieceId));
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_pieces').doc(pieceId).delete();
  }

  await writeAuditLog({
    workspaceId,
    action: 'media.delete',
    actorUid,
    resource: 'media_pieces',
    resourceId: pieceId,
  });
}

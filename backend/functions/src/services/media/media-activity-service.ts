/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import type { MemberRecord } from '../members/members-types';
import {
  commentPreview,
  eventsForUpdate,
  paginateNewestFirst,
  type PieceEventDraft,
} from './media-history-diff';
import type {
  MediaActivityPage,
  MediaCommentRecord,
  MediaPieceEventPayload,
  MediaPieceEventRecord,
  MediaPieceEventType,
  MediaReactionEmoji,
} from './media-activity-types';
import { seedMediaActivity } from '../demo/desk-seed-media-activity';
import { brand } from '../../config/brand';
import { findDemoMediaPiece, pieceKey } from './media-piece-lookup';
import { SYSTEM_MEDIA_ACTOR_UID, type MediaPieceFields, type MediaPieceRecord } from './media-types';

function commentKey(workspaceId: string, pieceId: string, commentId: string): string {
  return `${workspaceId}:${pieceId}:${commentId}`;
}

function eventKey(workspaceId: string, pieceId: string, eventId: string): string {
  return `${workspaceId}:${pieceId}:${eventId}`;
}

function commentsCol(workspaceId: string, pieceId: string) {
  return getAdminDb().collection('workspaces').doc(workspaceId).collection('media_pieces').doc(pieceId).collection('comments');
}

function eventsCol(workspaceId: string, pieceId: string) {
  return getAdminDb().collection('workspaces').doc(workspaceId).collection('media_pieces').doc(pieceId).collection('events');
}

function pieceRef(workspaceId: string, pieceId: string) {
  return getAdminDb().collection('workspaces').doc(workspaceId).collection('media_pieces').doc(pieceId);
}

let lastEventMs = 0;

function nextIso(): string {
  const now = Date.now();
  lastEventMs = Math.max(lastEventMs + 1, now);
  return new Date(lastEventMs).toISOString();
}

async function lookupActorName(workspaceId: string, actorUid: string): Promise<string> {
  if (actorUid === SYSTEM_MEDIA_ACTOR_UID) return brand.productName;
  if (demoMode) {
    for (const row of memoryDb.members.values()) {
      if (row.workspaceId === workspaceId && row.uid === actorUid) return row.displayName;
    }
    return actorUid;
  }

  const snap = await getAdminDb().collection('workspaces').doc(workspaceId).collection('members').get();
  const member = snap.docs.map((doc) => doc.data() as MemberRecord).find((row) => row.uid === actorUid);
  return member?.displayName || actorUid;
}

async function adoptListedPieces(workspaceId: string, actorUid: string): Promise<void> {
  if (!demoMode) return;
  const { listMediaPieces } = await import('./media-service');
  const pieces = await listMediaPieces(workspaceId, actorUid);
  for (const piece of pieces) {
    memoryDb.mediaPieces.set(pieceKey(piece.workspaceId, piece.id), piece);
  }
  const actorName = await lookupActorName(workspaceId, actorUid);
  seedMediaActivity(workspaceId, actorUid, actorName === actorUid ? 'Admin' : actorName);
}

async function requirePiece(workspaceId: string, pieceId: string, actorUid: string): Promise<MediaPieceRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    await adoptListedPieces(workspaceId, actorUid);
    const row = findDemoMediaPiece(workspaceId, pieceId);
    if (!row) throw new HttpError(404, 'Media piece not found');
    return row;
  }

  const doc = await pieceRef(workspaceId, pieceId).get();
  if (!doc.exists) throw new HttpError(404, 'Media piece not found');
  return doc.data() as MediaPieceRecord;
}

async function writeEvent(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  type: MediaPieceEventType,
  payload: MediaPieceEventPayload,
  createdAt: string,
): Promise<MediaPieceEventRecord> {
  const record: MediaPieceEventRecord = {
    id: randomUUID(),
    workspaceId,
    pieceId,
    type,
    actorUid,
    actorName: await lookupActorName(workspaceId, actorUid),
    createdAt,
    payload,
  };

  if (demoMode) {
    memoryDb.mediaEvents.set(eventKey(workspaceId, pieceId, record.id), record);
  } else {
    await eventsCol(workspaceId, pieceId).doc(record.id).set(record);
  }
  return record;
}

async function writeDrafts(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  drafts: PieceEventDraft[],
): Promise<void> {
  for (const draft of drafts) {
    await writeEvent(workspaceId, pieceId, actorUid, draft.type, draft.payload, nextIso());
  }
}

export async function recordPieceCreated(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  createdAt: string,
  title = '',
): Promise<void> {
  const parsed = Date.parse(createdAt);
  if (!Number.isNaN(parsed)) lastEventMs = Math.max(lastEventMs, parsed);
  await writeEvent(workspaceId, pieceId, actorUid, 'created', title ? { title } : {}, nextIso());
}

export async function recordPieceUpdated(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  before: MediaPieceFields,
  after: MediaPieceFields,
): Promise<void> {
  await writeDrafts(workspaceId, pieceId, actorUid, eventsForUpdate(before, after));
}

export async function recordPieceDeleted(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  title: string,
): Promise<void> {
  await writeEvent(workspaceId, pieceId, actorUid, 'deleted', { title }, nextIso());
}

export async function deletePieceActivity(workspaceId: string, pieceId: string): Promise<void> {
  if (demoMode) {
    for (const [key, row] of memoryDb.mediaComments) {
      if (row.workspaceId === workspaceId && row.pieceId === pieceId) memoryDb.mediaComments.delete(key);
    }
    return;
  }

  const commentSnap = await commentsCol(workspaceId, pieceId).get();
  const batch = getAdminDb().batch();
  commentSnap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function listCommentRecords(workspaceId: string, pieceId: string): Promise<MediaCommentRecord[]> {
  if (demoMode) {
    return [...memoryDb.mediaComments.values()].filter(
      (row) => row.workspaceId === workspaceId && row.pieceId === pieceId,
    );
  }
  const snap = await commentsCol(workspaceId, pieceId).get();
  return snap.docs.map((doc) => doc.data() as MediaCommentRecord);
}

async function listEventRecords(workspaceId: string, pieceId: string): Promise<MediaPieceEventRecord[]> {
  if (demoMode) {
    return [...memoryDb.mediaEvents.values()].filter(
      (row) => row.workspaceId === workspaceId && row.pieceId === pieceId,
    );
  }
  const snap = await eventsCol(workspaceId, pieceId).get();
  return snap.docs.map((doc) => doc.data() as MediaPieceEventRecord);
}

async function listWorkspaceEventRecords(workspaceId: string): Promise<MediaPieceEventRecord[]> {
  if (demoMode) {
    return [...memoryDb.mediaEvents.values()].filter((row) => row.workspaceId === workspaceId);
  }
  const snap = await getAdminDb().collectionGroup('events').where('workspaceId', '==', workspaceId).get();
  return snap.docs.map((doc) => doc.data() as MediaPieceEventRecord);
}

export async function listMediaComments(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  page: number,
  pageSize: number,
): Promise<MediaActivityPage<MediaCommentRecord>> {
  await requirePiece(workspaceId, pieceId, actorUid);
  return paginateNewestFirst(await listCommentRecords(workspaceId, pieceId), page, pageSize);
}

export async function getMediaComment(
  workspaceId: string,
  pieceId: string,
  commentId: string,
  actorUid: string,
): Promise<MediaCommentRecord> {
  await requirePiece(workspaceId, pieceId, actorUid);
  if (demoMode) {
    const row = memoryDb.mediaComments.get(commentKey(workspaceId, pieceId, commentId));
    if (!row) throw new HttpError(404, 'Comment not found');
    return row;
  }

  const doc = await commentsCol(workspaceId, pieceId).doc(commentId).get();
  if (!doc.exists) throw new HttpError(404, 'Comment not found');
  return doc.data() as MediaCommentRecord;
}

export async function createMediaComment(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  body: string,
): Promise<MediaCommentRecord> {
  await requirePiece(workspaceId, pieceId, actorUid);
  const now = nextIso();
  const record: MediaCommentRecord = {
    id: randomUUID(),
    workspaceId,
    pieceId,
    body: body.trim(),
    authorUid: actorUid,
    authorName: await lookupActorName(workspaceId, actorUid),
    createdAt: now,
    updatedAt: now,
    reactions: {},
  };

  if (demoMode) {
    memoryDb.mediaComments.set(commentKey(workspaceId, pieceId, record.id), record);
  } else {
    await commentsCol(workspaceId, pieceId).doc(record.id).set(record);
  }

  await writeEvent(
    workspaceId,
    pieceId,
    actorUid,
    'comment',
    { commentId: record.id, commentPreview: commentPreview(record.body) },
    now,
  );
  return record;
}

export async function toggleMediaCommentReaction(
  workspaceId: string,
  pieceId: string,
  commentId: string,
  actorUid: string,
  emoji: MediaReactionEmoji,
): Promise<MediaCommentRecord> {
  const comment = await getMediaComment(workspaceId, pieceId, commentId, actorUid);
  const current = comment.reactions[emoji] ?? [];
  const hasReacted = current.includes(actorUid);
  const nextUids = hasReacted ? current.filter((uid) => uid !== actorUid) : [...current, actorUid];
  const reactions = { ...comment.reactions };
  if (nextUids.length) reactions[emoji] = nextUids;
  else delete reactions[emoji];

  const record: MediaCommentRecord = {
    ...comment,
    reactions,
    updatedAt: nextIso(),
  };

  if (demoMode) {
    memoryDb.mediaComments.set(commentKey(workspaceId, pieceId, commentId), record);
  } else {
    await commentsCol(workspaceId, pieceId).doc(commentId).set(record);
  }

  if (!hasReacted) {
    await writeEvent(
      workspaceId,
      pieceId,
      actorUid,
      'reaction',
      {
        commentId,
        commentPreview: commentPreview(comment.body),
        emoji,
      },
      record.updatedAt,
    );
  }
  return record;
}

export async function listMediaHistory(
  workspaceId: string,
  pieceId: string,
  actorUid: string,
  page: number,
  pageSize: number,
): Promise<MediaActivityPage<MediaPieceEventRecord>> {
  await requirePiece(workspaceId, pieceId, actorUid);
  return paginateNewestFirst(await listEventRecords(workspaceId, pieceId), page, pageSize);
}

export async function listRecentMediaEvents(
  workspaceId: string,
  actorUid: string,
  page: number,
  pageSize: number,
): Promise<MediaActivityPage<MediaPieceEventRecord>> {
  await ensureWorkspace(workspaceId, actorUid);
  await adoptListedPieces(workspaceId, actorUid);
  return paginateNewestFirst(await listWorkspaceEventRecords(workspaceId), page, pageSize);
}

export async function getMediaHistoryEvent(
  workspaceId: string,
  pieceId: string,
  eventId: string,
  actorUid: string,
): Promise<MediaPieceEventRecord> {
  await requirePiece(workspaceId, pieceId, actorUid);
  if (demoMode) {
    const row = memoryDb.mediaEvents.get(eventKey(workspaceId, pieceId, eventId));
    if (!row) throw new HttpError(404, 'History event not found');
    return row;
  }

  const doc = await eventsCol(workspaceId, pieceId).doc(eventId).get();
  if (!doc.exists) throw new HttpError(404, 'History event not found');
  return doc.data() as MediaPieceEventRecord;
}

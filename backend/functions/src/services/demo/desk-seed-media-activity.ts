/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { memoryDb } from '../../store/memory-store';
import type { MediaCommentRecord, MediaPieceEventPayload, MediaPieceEventRecord, MediaPieceEventType } from '../media/media-activity-types';
import type { MediaPieceRecord } from '../media/media-types';

function isoDaysFromNow(days: number, hour = 9): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function putEvent(
  workspaceId: string,
  pieceId: string,
  type: MediaPieceEventType,
  actorUid: string,
  actorName: string,
  createdAt: string,
  payload: MediaPieceEventPayload = {},
): void {
  const record: MediaPieceEventRecord = {
    id: randomUUID(),
    workspaceId,
    pieceId,
    type,
    actorUid,
    actorName,
    createdAt,
    payload,
  };
  memoryDb.mediaEvents.set(`${workspaceId}:${pieceId}:${record.id}`, record);
}

function putComment(
  workspaceId: string,
  pieceId: string,
  body: string,
  authorUid: string,
  authorName: string,
  createdAt: string,
  reactions: Record<string, string[]> = {},
): MediaCommentRecord {
  const record: MediaCommentRecord = {
    id: randomUUID(),
    workspaceId,
    pieceId,
    body,
    authorUid,
    authorName,
    createdAt,
    updatedAt: createdAt,
    reactions,
  };
  memoryDb.mediaComments.set(`${workspaceId}:${pieceId}:${record.id}`, record);
  putEvent(workspaceId, pieceId, 'comment', authorUid, authorName, createdAt, {
    commentId: record.id,
    commentPreview: body,
  });
  return record;
}

function seedPieceTimeline(
  piece: MediaPieceRecord,
  actorUid: string,
  actorName: string,
): void {
  const createdAt = piece.createdAt || isoDaysFromNow(-8);
  putEvent(piece.workspaceId, piece.id, 'created', actorUid, actorName, createdAt, { title: piece.title });
  if (piece.editorUids.length) {
    putEvent(piece.workspaceId, piece.id, 'assigned', actorUid, actorName, isoDaysFromNow(-7, 10), {
      role: 'editor',
      addedUids: piece.editorUids,
      removedUids: [],
    });
  }
  if (piece.reviewerUids.length) {
    putEvent(piece.workspaceId, piece.id, 'assigned', actorUid, actorName, isoDaysFromNow(-7, 11), {
      role: 'reviewer',
      addedUids: piece.reviewerUids,
      removedUids: [],
    });
  }
  if (piece.deployedUids.length) {
    putEvent(piece.workspaceId, piece.id, 'assigned', actorUid, actorName, isoDaysFromNow(-7, 12), {
      role: 'deployed',
      addedUids: piece.deployedUids,
      removedUids: [],
    });
  }
  if (piece.status !== 'not_started') {
    putEvent(piece.workspaceId, piece.id, 'status', actorUid, actorName, piece.updatedAt || isoDaysFromNow(-6, 9), {
      statusFrom: 'not_started',
      statusTo: piece.status,
    });
  }
}

/**
 * Writes history, comments, and reactions for demo pieces.
 * Safe to call when the desk already exists (hot reload / long-lived local API).
 */
export function seedMediaActivity(workspaceId: string, actorUid: string, actorName = 'Admin'): void {
  if (process.env.VITEST === 'true') return;
  const pieces = [...memoryDb.mediaPieces.values()].filter((row) => row.workspaceId === workspaceId);
  if (pieces.length === 0) return;

  const hasComments = (pieceId: string) =>
    [...memoryDb.mediaComments.values()].some((row) => row.workspaceId === workspaceId && row.pieceId === pieceId);
  const hasEvents = (pieceId: string) =>
    [...memoryDb.mediaEvents.values()].some((row) => row.workspaceId === workspaceId && row.pieceId === pieceId);

  for (const piece of pieces) {
    if (!hasEvents(piece.id)) seedPieceTimeline(piece, actorUid, actorName);
  }

  const byTitle = (title: string) => pieces.find((row) => row.title === title);

  const reel = byTitle('Hak hak challenge reel');
  if (reel && !hasComments(reel.id)) {
    const first = putComment(
      workspaceId,
      reel.id,
      'Caption is ready. Rico, post after the session stills go up.',
      'staff-ana',
      'Ana Kawani',
      isoDaysFromNow(-4, 11),
      { '👍': [actorUid] },
    );
    putEvent(workspaceId, reel.id, 'reaction', actorUid, actorName, isoDaysFromNow(-4, 12), {
      commentId: first.id,
      commentPreview: first.body,
      emoji: '👍',
    });
    const posted = putComment(
      workspaceId,
      reel.id,
      'Posted. FB URL is on the piece.',
      'staff-rico',
      'Rico Bilang',
      isoDaysFromNow(-4, 16),
      { '🎉': ['staff-ana'] },
    );
    putEvent(workspaceId, reel.id, 'reaction', 'staff-ana', 'Ana Kawani', isoDaysFromNow(-4, 17), {
      commentId: posted.id,
      commentPreview: posted.body,
      emoji: '🎉',
    });
    putComment(
      workspaceId,
      reel.id,
      'Trim the first two seconds — the clap is loud.',
      actorUid,
      actorName,
      isoDaysFromNow(-3, 9),
    );
    putComment(
      workspaceId,
      reel.id,
      'Trimmed. Ready to review the caption again.',
      'staff-ana',
      'Ana Kawani',
      isoDaysFromNow(-3, 13),
    );
    const watch = putComment(
      workspaceId,
      reel.id,
      'Looks good. Schedule after the session stills.',
      'staff-rico',
      'Rico Bilang',
      isoDaysFromNow(-2, 10),
      { '👀': [actorUid, 'staff-ana'] },
    );
    putEvent(workspaceId, reel.id, 'reaction', actorUid, actorName, isoDaysFromNow(-2, 11), {
      commentId: watch.id,
      commentPreview: watch.body,
      emoji: '👀',
    });
    putComment(
      workspaceId,
      reel.id,
      'Live. Watch comments on FB for a follow-up card.',
      actorUid,
      actorName,
      isoDaysFromNow(-1, 8),
    );
  }

  const session = byTitle('46th Regular Session');
  if (session && !hasComments(session.id)) {
    const note = putComment(
      workspaceId,
      session.id,
      'Shoot kit is packed. Ana has the stills after the session.',
      actorUid,
      actorName,
      isoDaysFromNow(-1, 15),
      { '👍': ['staff-ana'] },
    );
    putEvent(workspaceId, session.id, 'reaction', 'staff-ana', 'Ana Kawani', isoDaysFromNow(-1, 16), {
      commentId: note.id,
      commentPreview: note.body,
      emoji: '👍',
    });
  }

  const deskHours = byTitle('Desk hours — how to file');
  if (deskHours && !hasComments(deskHours.id)) {
    putComment(
      workspaceId,
      deskHours.id,
      'Intro is long. Cut to the three steps.',
      'staff-ana',
      'Ana Kawani',
      isoDaysFromNow(-2, 8),
    );
    const ready = putComment(
      workspaceId,
      deskHours.id,
      'Cut is in. Ready for review.',
      'staff-rico',
      'Rico Bilang',
      isoDaysFromNow(-1, 10),
      { '❤️': [actorUid] },
    );
    putEvent(workspaceId, deskHours.id, 'reaction', actorUid, actorName, isoDaysFromNow(-1, 11), {
      commentId: ready.id,
      commentPreview: ready.body,
      emoji: '❤️',
    });
  }

  const reminder = byTitle('Claim window reminder');
  if (reminder && !hasComments(reminder.id)) {
    putComment(
      workspaceId,
      reminder.id,
      'Type is large enough for the hallway screen.',
      'staff-rico',
      'Rico Bilang',
      isoDaysFromNow(-1, 14),
      { '👍': [actorUid, 'staff-ana'] },
    );
  }

  const flood = byTitle('Flood assistance message');
  if (flood && !hasComments(flood.id)) {
    const note = putComment(
      workspaceId,
      flood.id,
      'Posted copy matches the claim window hours.',
      actorUid,
      actorName,
      isoDaysFromNow(0, 8),
      { '🎉': ['staff-ana', 'staff-rico'] },
    );
    putEvent(workspaceId, flood.id, 'reaction', 'staff-ana', 'Ana Kawani', isoDaysFromNow(0, 9), {
      commentId: note.id,
      commentPreview: note.body,
      emoji: '🎉',
    });
  }

  seedExtraPieceNotes(workspaceId, pieces, actorUid, actorName, hasComments);
  seedDeletedDemos(workspaceId, actorUid, actorName);
}

const EXTRA_NOTES = [
  'Need a trim on the intro.',
  'Caption matches the claim window.',
  'Type is large enough for the hallway screen.',
  'Cut is in. Ready for review.',
  'Posted copy matches the desk hours.',
] as const;

const EXTRA_EMOJIS = ['👍', '❤️', '😂', '👀'] as const;

function seedExtraPieceNotes(
  workspaceId: string,
  pieces: MediaPieceRecord[],
  actorUid: string,
  actorName: string,
  hasComments: (pieceId: string) => boolean,
): void {
  const actors = [
    { uid: actorUid, name: actorName },
    { uid: 'staff-ana', name: 'Ana Kawani' },
    { uid: 'staff-rico', name: 'Rico Bilang' },
  ];
  pieces.forEach((piece, index) => {
    if (hasComments(piece.id) || index % 4 !== 0) return;
    const author = actors[index % actors.length];
    const body = EXTRA_NOTES[index % EXTRA_NOTES.length];
    const createdAt = isoDaysFromNow(-((index % 5) + 1), 9 + (index % 6));
    const react = index % 8 === 0;
    const reactor = actors[(index + 1) % actors.length];
    const emoji = EXTRA_EMOJIS[index % EXTRA_EMOJIS.length];
    const comment = putComment(
      workspaceId,
      piece.id,
      body,
      author.uid,
      author.name,
      createdAt,
      react ? { [emoji]: [reactor.uid] } : {},
    );
    if (react) {
      putEvent(workspaceId, piece.id, 'reaction', reactor.uid, reactor.name, isoDaysFromNow(-((index % 5) + 1), 10), {
        commentId: comment.id,
        commentPreview: comment.body,
        emoji,
      });
    }
    if (index % 6 === 0) {
      putEvent(workspaceId, piece.id, 'updated', author.uid, author.name, isoDaysFromNow(-((index % 4) + 1), 14), {
        title: piece.title,
      });
    }
  });
}

function seedDeletedDemos(workspaceId: string, actorUid: string, actorName: string): void {
  const titles = ['Old hallway poster', 'Duplicate session stills', 'Pulled storm card', 'Unused podcast cut'];
  const hasDeleted = [...memoryDb.mediaEvents.values()].some(
    (row) => row.workspaceId === workspaceId && row.type === 'deleted',
  );
  if (hasDeleted) return;
  titles.forEach((title, index) => {
    const pieceId = `demo-deleted-${index + 1}`;
    const createdAt = isoDaysFromNow(-(index + 2), 8);
    putEvent(workspaceId, pieceId, 'created', actorUid, actorName, createdAt, { title });
    putEvent(workspaceId, pieceId, 'deleted', actorUid, actorName, isoDaysFromNow(-(index + 1), 15), { title });
  });
}

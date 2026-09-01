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
import type { EventKind, EventRecord } from './events-types';

function eventKey(workspaceId: string, eventId: string): string {
  return `${workspaceId}:${eventId}`;
}

export async function listEvents(workspaceId: string, actorUid: string): Promise<EventRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    return [...memoryDb.events.values()]
      .filter((row) => row.workspaceId === workspaceId)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  const snap = await getAdminDb().collection('workspaces').doc(workspaceId).collection('events').get();
  return snap.docs
    .map((doc) => doc.data() as EventRecord)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function getEvent(workspaceId: string, eventId: string, actorUid: string): Promise<EventRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    const row = memoryDb.events.get(eventKey(workspaceId, eventId));
    if (!row) throw new HttpError(404, 'Event not found');
    return row;
  }

  const doc = await getAdminDb().collection('workspaces').doc(workspaceId).collection('events').doc(eventId).get();
  if (!doc.exists) throw new HttpError(404, 'Event not found');
  return doc.data() as EventRecord;
}

type EventWrite = {
  title: string;
  notes: string;
  startsAt: string;
  endsAt: string;
  location: string;
  kind: EventKind;
};

export async function createEvent(workspaceId: string, actorUid: string, input: EventWrite): Promise<EventRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const now = new Date().toISOString();
  const record: EventRecord = {
    id: randomUUID(),
    workspaceId,
    ...input,
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  };

  if (demoMode) {
    memoryDb.events.set(eventKey(workspaceId, record.id), record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('events').doc(record.id).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'events.create',
    actorUid,
    resource: 'events',
    resourceId: record.id,
  });
  await createNotification(
    workspaceId,
    actorUid,
    { title: `Bagong event: ${record.title}`, body: record.location, kind: 'event', read: false },
    { audit: false },
  );
  return record;
}

export async function updateEvent(
  workspaceId: string,
  eventId: string,
  actorUid: string,
  input: EventWrite,
): Promise<EventRecord> {
  const existing = await getEvent(workspaceId, eventId, actorUid);
  const record: EventRecord = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (demoMode) {
    memoryDb.events.set(eventKey(workspaceId, eventId), record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('events').doc(eventId).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'events.update',
    actorUid,
    resource: 'events',
    resourceId: eventId,
  });
  return record;
}

export async function deleteEvent(workspaceId: string, eventId: string, actorUid: string): Promise<void> {
  await getEvent(workspaceId, eventId, actorUid);

  if (demoMode) {
    memoryDb.events.delete(eventKey(workspaceId, eventId));
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('events').doc(eventId).delete();
  }

  await writeAuditLog({
    workspaceId,
    action: 'events.delete',
    actorUid,
    resource: 'events',
    resourceId: eventId,
  });
}

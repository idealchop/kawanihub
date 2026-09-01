/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { writeAuditLog } from '../audit/audit-service';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import type { NotificationKind, NotificationRecord } from './notifications-types';

function notificationKey(workspaceId: string, notificationId: string): string {
  return `${workspaceId}:${notificationId}`;
}

export async function listNotifications(workspaceId: string, actorUid: string): Promise<NotificationRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    return [...memoryDb.notifications.values()]
      .filter((row) => row.workspaceId === workspaceId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const snap = await getAdminDb().collection('workspaces').doc(workspaceId).collection('notifications').get();
  return snap.docs
    .map((doc) => doc.data() as NotificationRecord)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getNotification(
  workspaceId: string,
  notificationId: string,
  actorUid: string,
): Promise<NotificationRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    const row = memoryDb.notifications.get(notificationKey(workspaceId, notificationId));
    if (!row) throw new HttpError(404, 'Notification not found');
    return row;
  }

  const doc = await getAdminDb()
    .collection('workspaces')
    .doc(workspaceId)
    .collection('notifications')
    .doc(notificationId)
    .get();
  if (!doc.exists) throw new HttpError(404, 'Notification not found');
  return doc.data() as NotificationRecord;
}

type NotificationWrite = {
  title: string;
  body: string;
  kind: NotificationKind;
  read: boolean;
};

export async function createNotification(
  workspaceId: string,
  actorUid: string,
  input: NotificationWrite,
  options?: { audit?: boolean },
): Promise<NotificationRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const record: NotificationRecord = {
    id: randomUUID(),
    workspaceId,
    ...input,
    createdBy: actorUid,
    createdAt: new Date().toISOString(),
  };

  if (demoMode) {
    memoryDb.notifications.set(notificationKey(workspaceId, record.id), record);
  } else {
    await getAdminDb()
      .collection('workspaces')
      .doc(workspaceId)
      .collection('notifications')
      .doc(record.id)
      .set(record);
  }

  if (options?.audit !== false) {
    await writeAuditLog({
      workspaceId,
      action: 'notifications.create',
      actorUid,
      resource: 'notifications',
      resourceId: record.id,
    });
  }
  return record;
}

export async function updateNotification(
  workspaceId: string,
  notificationId: string,
  actorUid: string,
  input: Partial<NotificationWrite>,
): Promise<NotificationRecord> {
  const existing = await getNotification(workspaceId, notificationId, actorUid);
  const record: NotificationRecord = {
    ...existing,
    ...input,
  };

  if (demoMode) {
    memoryDb.notifications.set(notificationKey(workspaceId, notificationId), record);
  } else {
    await getAdminDb()
      .collection('workspaces')
      .doc(workspaceId)
      .collection('notifications')
      .doc(notificationId)
      .set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'notifications.update',
    actorUid,
    resource: 'notifications',
    resourceId: notificationId,
  });
  return record;
}

export async function deleteNotification(workspaceId: string, notificationId: string, actorUid: string): Promise<void> {
  await getNotification(workspaceId, notificationId, actorUid);

  if (demoMode) {
    memoryDb.notifications.delete(notificationKey(workspaceId, notificationId));
  } else {
    await getAdminDb()
      .collection('workspaces')
      .doc(workspaceId)
      .collection('notifications')
      .doc(notificationId)
      .delete();
  }

  await writeAuditLog({
    workspaceId,
    action: 'notifications.delete',
    actorUid,
    resource: 'notifications',
    resourceId: notificationId,
  });
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { writeAuditLog } from '../audit/audit-service';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import type { ItemRecord } from './items-types';

function itemKey(workspaceId: string, itemId: string): string {
  return `${workspaceId}:${itemId}`;
}

export async function listItems(workspaceId: string, actorUid: string): Promise<ItemRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    return [...memoryDb.items.values()].filter((item) => item.workspaceId === workspaceId);
  }

  const snap = await getAdminDb()
    .collection('workspaces')
    .doc(workspaceId)
    .collection('items')
    .get();
  return snap.docs.map((doc) => doc.data() as ItemRecord);
}

export async function getItem(workspaceId: string, itemId: string, actorUid: string): Promise<ItemRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    const item = memoryDb.items.get(itemKey(workspaceId, itemId));
    if (!item) throw new HttpError(404, 'Item not found');
    return item;
  }

  const doc = await getAdminDb()
    .collection('workspaces')
    .doc(workspaceId)
    .collection('items')
    .doc(itemId)
    .get();
  if (!doc.exists) throw new HttpError(404, 'Item not found');
  return doc.data() as ItemRecord;
}

export async function createItem(
  workspaceId: string,
  actorUid: string,
  input: { title: string; notes: string; status: 'open' | 'done' },
): Promise<ItemRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const now = new Date().toISOString();
  const record: ItemRecord = {
    id: randomUUID(),
    workspaceId,
    title: input.title,
    notes: input.notes,
    status: input.status,
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  };

  if (demoMode) {
    memoryDb.items.set(itemKey(workspaceId, record.id), record);
  } else {
    await getAdminDb()
      .collection('workspaces')
      .doc(workspaceId)
      .collection('items')
      .doc(record.id)
      .set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'items.create',
    actorUid,
    resource: 'items',
    resourceId: record.id,
  });
  return record;
}

export async function updateItem(
  workspaceId: string,
  itemId: string,
  actorUid: string,
  input: { title: string; notes: string; status: 'open' | 'done' },
): Promise<ItemRecord> {
  const existing = await getItem(workspaceId, itemId, actorUid);
  const record: ItemRecord = {
    ...existing,
    title: input.title,
    notes: input.notes,
    status: input.status,
    updatedAt: new Date().toISOString(),
  };

  if (demoMode) {
    memoryDb.items.set(itemKey(workspaceId, itemId), record);
  } else {
    await getAdminDb()
      .collection('workspaces')
      .doc(workspaceId)
      .collection('items')
      .doc(itemId)
      .set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'items.update',
    actorUid,
    resource: 'items',
    resourceId: itemId,
  });
  return record;
}

export async function deleteItem(workspaceId: string, itemId: string, actorUid: string): Promise<void> {
  await getItem(workspaceId, itemId, actorUid);

  if (demoMode) {
    memoryDb.items.delete(itemKey(workspaceId, itemId));
  } else {
    await getAdminDb()
      .collection('workspaces')
      .doc(workspaceId)
      .collection('items')
      .doc(itemId)
      .delete();
  }

  await writeAuditLog({
    workspaceId,
    action: 'items.delete',
    actorUid,
    resource: 'items',
    resourceId: itemId,
  });
}

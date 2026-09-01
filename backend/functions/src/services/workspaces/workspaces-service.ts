/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { memoryDb } from '../../store/memory-store';
import { seedDemoDesk } from '../demo/desk-seed';
import type { WorkspaceRecord } from './workspaces-types';

export async function listWorkspaces(ownerUid: string): Promise<WorkspaceRecord[]> {
  if (demoMode) {
    return [...memoryDb.workspaces.values()].filter((workspace) => workspace.ownerUid === ownerUid);
  }

  const snap = await getAdminDb().collection('workspaces').where('ownerUid', '==', ownerUid).get();
  return snap.docs.map((doc) => doc.data() as WorkspaceRecord);
}

export async function ensureWorkspace(id: string, ownerUid: string, name = 'Demo workspace'): Promise<WorkspaceRecord> {
  const existing = await getWorkspace(id);
  if (existing) return existing;

  const now = new Date().toISOString();
  const record: WorkspaceRecord = {
    id,
    name,
    slug: id,
    ownerUid,
    createdAt: now,
    updatedAt: now,
  };

  if (demoMode) {
    memoryDb.workspaces.set(id, record);
    seedDemoDesk(id, ownerUid);
    return record;
  }

  await getAdminDb().collection('workspaces').doc(id).set(record);
  return record;
}

export async function createWorkspace(
  ownerUid: string,
  input: { name: string; slug: string; themePrimary?: string },
): Promise<WorkspaceRecord> {
  const now = new Date().toISOString();
  const record: WorkspaceRecord = {
    id: randomUUID(),
    name: input.name,
    slug: input.slug,
    ownerUid,
    themePrimary: input.themePrimary,
    createdAt: now,
    updatedAt: now,
  };

  if (demoMode) {
    memoryDb.workspaces.set(record.id, record);
    return record;
  }

  await getAdminDb().collection('workspaces').doc(record.id).set(record);
  return record;
}

async function getWorkspace(id: string): Promise<WorkspaceRecord | undefined> {
  if (demoMode) return memoryDb.workspaces.get(id);
  const doc = await getAdminDb().collection('workspaces').doc(id).get();
  return doc.exists ? (doc.data() as WorkspaceRecord) : undefined;
}

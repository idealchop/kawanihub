/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomUUID } from 'crypto';
import { demoMode, getAdminDb } from '../../config/firebase-admin';
import { HttpError } from '../../utils/errors';
import { memoryDb } from '../../store/memory-store';
import { writeAuditLog } from '../audit/audit-service';
import { ensureWorkspace } from '../workspaces/workspaces-service';
import type { MediaContentTypeRecord, MediaTypeIcon, MediaTypeStatus } from './media-content-type-types';
import { RESERVED_MEDIA_TYPE_SLUGS } from './media-content-type-types';

function typeKey(workspaceId: string, typeId: string): string {
  return `${workspaceId}:${typeId}`;
}

function sortTypes(rows: MediaContentTypeRecord[]): MediaContentTypeRecord[] {
  return [...rows].sort((a, b) => a.name.localeCompare(b.name) || a.slug.localeCompare(b.slug));
}

export function slugifyTypeName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const slug = base || 'type';
  return (RESERVED_MEDIA_TYPE_SLUGS as readonly string[]).includes(slug) ? `${slug}-content` : slug;
}

async function listRows(workspaceId: string): Promise<MediaContentTypeRecord[]> {
  if (demoMode) {
    return sortTypes([...memoryDb.mediaContentTypes.values()].filter((row) => row.workspaceId === workspaceId));
  }
  const snap = await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_content_types').get();
  return sortTypes(snap.docs.map((doc) => doc.data() as MediaContentTypeRecord));
}

export async function listMediaContentTypes(workspaceId: string, actorUid: string): Promise<MediaContentTypeRecord[]> {
  await ensureWorkspace(workspaceId, actorUid);
  return listRows(workspaceId);
}

export async function getMediaContentType(
  workspaceId: string,
  typeId: string,
  actorUid: string,
): Promise<MediaContentTypeRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  if (demoMode) {
    const row = memoryDb.mediaContentTypes.get(typeKey(workspaceId, typeId));
    if (!row) throw new HttpError(404, 'Content type not found');
    return row;
  }
  const doc = await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_content_types').doc(typeId).get();
  if (!doc.exists) throw new HttpError(404, 'Content type not found');
  return doc.data() as MediaContentTypeRecord;
}

export async function getMediaContentTypeBySlug(
  workspaceId: string,
  slug: string,
): Promise<MediaContentTypeRecord | undefined> {
  const rows = await listRows(workspaceId);
  return rows.find((row) => row.slug === slug);
}

export async function assertMediaTypeSlug(workspaceId: string, slug: string): Promise<MediaContentTypeRecord> {
  const row = await getMediaContentTypeBySlug(workspaceId, slug);
  if (!row) throw new HttpError(400, 'Unknown content type');
  return row;
}

function uniqueSlug(name: string, existing: MediaContentTypeRecord[]): string {
  const base = slugifyTypeName(name);
  if (!existing.some((row) => row.slug === base)) return base;
  let index = 2;
  while (existing.some((row) => row.slug === `${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

type MediaContentTypeWrite = {
  name: string;
  hint: string;
  icon: MediaTypeIcon;
  status: MediaTypeStatus;
};

export async function createMediaContentType(
  workspaceId: string,
  actorUid: string,
  input: MediaContentTypeWrite,
): Promise<MediaContentTypeRecord> {
  await ensureWorkspace(workspaceId, actorUid);
  const existing = await listRows(workspaceId);
  const now = new Date().toISOString();
  const record: MediaContentTypeRecord = {
    id: randomUUID(),
    workspaceId,
    slug: uniqueSlug(input.name, existing),
    ...input,
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  };

  if (demoMode) {
    memoryDb.mediaContentTypes.set(typeKey(workspaceId, record.id), record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_content_types').doc(record.id).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'media_type.create',
    actorUid,
    resource: 'media_content_types',
    resourceId: record.id,
  });
  return record;
}

export async function updateMediaContentType(
  workspaceId: string,
  typeId: string,
  actorUid: string,
  input: MediaContentTypeWrite,
): Promise<MediaContentTypeRecord> {
  const existing = await getMediaContentType(workspaceId, typeId, actorUid);
  const record: MediaContentTypeRecord = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (demoMode) {
    memoryDb.mediaContentTypes.set(typeKey(workspaceId, typeId), record);
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_content_types').doc(typeId).set(record);
  }

  await writeAuditLog({
    workspaceId,
    action: 'media_type.update',
    actorUid,
    resource: 'media_content_types',
    resourceId: typeId,
  });
  return record;
}

export async function deleteMediaContentType(workspaceId: string, typeId: string, actorUid: string): Promise<void> {
  const existing = await getMediaContentType(workspaceId, typeId, actorUid);
  const inUse = demoMode
    ? [...memoryDb.mediaPieces.values()].some((row) => row.workspaceId === workspaceId && row.type === existing.slug)
    : !(
        await getAdminDb()
          .collection('workspaces')
          .doc(workspaceId)
          .collection('media_pieces')
          .where('type', '==', existing.slug)
          .limit(1)
          .get()
      ).empty;
  if (inUse) throw new HttpError(409, 'Deactivate this type instead. Pieces still use it.');

  if (demoMode) {
    memoryDb.mediaContentTypes.delete(typeKey(workspaceId, typeId));
  } else {
    await getAdminDb().collection('workspaces').doc(workspaceId).collection('media_content_types').doc(typeId).delete();
  }

  await writeAuditLog({
    workspaceId,
    action: 'media_type.delete',
    actorUid,
    resource: 'media_content_types',
    resourceId: typeId,
  });
}

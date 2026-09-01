/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 *
 * One process-wide demo store. ts-node-dev reloads can otherwise split
 * media-service and media-activity-service onto different Maps, so the
 * board lists a piece that History/Comments cannot find.
 */
import type { AuditRecord } from '../services/audit/audit-types';
import type { DocumentRecord } from '../services/documents/documents-types';
import type { EventRecord } from '../services/events/events-types';
import type { SolicitationRecord } from '../services/solicitations/solicitation-types';
import type { ItemRecord } from '../services/items/items-types';
import type { MediaCommentRecord, MediaPieceEventRecord } from '../services/media/media-activity-types';
import type { MediaContentTypeRecord } from '../services/media/media-content-type-types';
import type { MediaPieceRecord } from '../services/media/media-types';
import type { MemberRecord } from '../services/members/members-types';
import type { NotificationRecord } from '../services/notifications/notifications-types';
import type { WorkspaceRecord } from '../services/workspaces/workspaces-types';

type MemoryMaps = {
  workspaces: Map<string, WorkspaceRecord>;
  items: Map<string, ItemRecord>;
  solicitations: Map<string, SolicitationRecord>;
  members: Map<string, MemberRecord>;
  notifications: Map<string, NotificationRecord>;
  mediaPieces: Map<string, MediaPieceRecord>;
  mediaContentTypes: Map<string, MediaContentTypeRecord>;
  mediaComments: Map<string, MediaCommentRecord>;
  mediaEvents: Map<string, MediaPieceEventRecord>;
  events: Map<string, EventRecord>;
  documents: Map<string, DocumentRecord>;
  auditLogs: AuditRecord[];
};

const root = globalThis as typeof globalThis & { __kawanihubMemoryDb?: MemoryMaps };

function createMaps(): MemoryMaps {
  return {
    workspaces: new Map(),
    items: new Map(),
    solicitations: new Map(),
    members: new Map(),
    notifications: new Map(),
    mediaPieces: new Map(),
    mediaContentTypes: new Map(),
    mediaComments: new Map(),
    mediaEvents: new Map(),
    events: new Map(),
    documents: new Map(),
    auditLogs: [],
  };
}

const maps = root.__kawanihubMemoryDb ?? (root.__kawanihubMemoryDb = createMaps());
if (!maps.mediaComments) maps.mediaComments = new Map();
if (!maps.mediaEvents) maps.mediaEvents = new Map();
root.__kawanihubMemoryDb = maps;

export const memoryDb = {
  ...maps,
  reset(): void {
    maps.workspaces.clear();
    maps.items.clear();
    maps.solicitations.clear();
    maps.members.clear();
    maps.notifications.clear();
    maps.mediaPieces.clear();
    maps.mediaContentTypes.clear();
    maps.mediaComments.clear();
    maps.mediaEvents.clear();
    maps.events.clear();
    maps.documents.clear();
    maps.auditLogs.length = 0;
  },
};

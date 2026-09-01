/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type AuditRecord = {
  id: string;
  workspaceId: string;
  action: string;
  actorUid: string;
  actorName?: string;
  detail?: string;
  resource: string;
  resourceId: string;
  createdAt: string;
};

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type NotificationKind = 'solicitation' | 'document' | 'event' | 'system' | 'user';

export type NotificationRecord = {
  id: string;
  workspaceId: string;
  title: string;
  body: string;
  kind: NotificationKind;
  read: boolean;
  createdBy: string;
  createdAt: string;
};

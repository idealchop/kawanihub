/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type NotificationKind = 'solicitation' | 'document' | 'event' | 'system' | 'user';

export type DeskNotification = {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  read: boolean;
  createdBy: string;
  createdAt: string;
};

export type NotificationListResponse = {
  notifications: DeskNotification[];
};

export type NotificationWriteInput = {
  title: string;
  body?: string;
  kind?: NotificationKind;
  read?: boolean;
};

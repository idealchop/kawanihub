/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type EventKind = 'meeting' | 'outreach' | 'deadline' | 'other';

export type EventRecord = {
  id: string;
  workspaceId: string;
  title: string;
  notes: string;
  startsAt: string;
  endsAt: string;
  location: string;
  kind: EventKind;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

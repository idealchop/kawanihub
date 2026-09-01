/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type EventKind = 'meeting' | 'outreach' | 'deadline' | 'other';

export type DeskEvent = {
  id: string;
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

export type EventListResponse = {
  events: DeskEvent[];
};

export type EventWriteInput = {
  title: string;
  notes?: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  kind?: EventKind;
};

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type ItemStatus = 'open' | 'done';

export type ItemRecord = {
  id: string;
  workspaceId: string;
  title: string;
  notes: string;
  status: ItemStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

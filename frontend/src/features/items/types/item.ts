/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type ItemStatus = 'open' | 'done';

export type Item = {
  id: string;
  title: string;
  notes: string;
  status: ItemStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ItemListResponse = {
  items: Item[];
};

export type ItemWriteInput = {
  title: string;
  notes?: string;
  status?: ItemStatus;
};

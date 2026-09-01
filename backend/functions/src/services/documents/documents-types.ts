/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type DocumentKind = 'request' | 'permit' | 'certification' | 'report' | 'other';
export type DocumentStatus = 'received' | 'in_review' | 'released' | 'returned';

export type DocumentRecord = {
  id: string;
  workspaceId: string;
  title: string;
  referenceNo: string;
  requester: string;
  barangay: string;
  kind: DocumentKind;
  status: DocumentStatus;
  dueAt: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

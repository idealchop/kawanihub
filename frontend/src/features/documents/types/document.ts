/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type DocumentKind = 'request' | 'permit' | 'certification' | 'report' | 'other';
export type DocumentStatus = 'received' | 'in_review' | 'released' | 'returned';

export type DeskDocument = {
  id: string;
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

export type DocumentListResponse = {
  documents: DeskDocument[];
};

export type DocumentWriteInput = {
  title: string;
  referenceNo?: string;
  requester: string;
  barangay?: string;
  kind?: DocumentKind;
  status?: DocumentStatus;
  dueAt?: string;
  notes?: string;
};

export const nextDocumentStatus: Record<DocumentStatus, DocumentStatus> = {
  received: 'in_review',
  in_review: 'released',
  released: 'returned',
  returned: 'received',
};

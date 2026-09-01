/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { memoryDb } from '../../../../store/memory-store';
import { createDocument, deleteDocument, listDocuments, updateDocument } from '../../../../services/documents/documents-service';

describe('documents-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('creates, lists, updates, and deletes a document', async () => {
    const created = await createDocument('demo-workspace', 'demo-owner', {
      title: 'Barangay clearance',
      referenceNo: 'DOC-1',
      requester: 'Rosa',
      barangay: 'San Roque',
      kind: 'certification',
      status: 'received',
      dueAt: '2026-08-30',
      notes: '',
    });
    expect(created.title).toBe('Barangay clearance');

    const listed = await listDocuments('demo-workspace', 'demo-owner');
    expect(listed).toHaveLength(1);

    const updated = await updateDocument('demo-workspace', created.id, 'demo-owner', {
      title: created.title,
      referenceNo: created.referenceNo,
      requester: created.requester,
      barangay: created.barangay,
      kind: created.kind,
      status: 'in_review',
      dueAt: created.dueAt,
      notes: created.notes,
    });
    expect(updated.status).toBe('in_review');

    await deleteDocument('demo-workspace', created.id, 'demo-owner');
    expect(await listDocuments('demo-workspace', 'demo-owner')).toHaveLength(0);
    expect(memoryDb.auditLogs.map((log) => log.action)).toEqual([
      'documents.create',
      'documents.update',
      'documents.delete',
    ]);
  });
});

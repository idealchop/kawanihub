/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { memoryDb } from '../../../../store/memory-store';
import { createItem, deleteItem, listItems, updateItem } from '../../../../services/items/items-service';

describe('items-service', () => {
  beforeEach(() => {
    memoryDb.reset();
  });

  it('creates, lists, updates, and deletes an item', async () => {
    const created = await createItem('demo-workspace', 'demo-owner', {
      title: 'Hello',
      notes: '',
      status: 'open',
    });
    expect(created.title).toBe('Hello');

    const listed = await listItems('demo-workspace', 'demo-owner');
    expect(listed).toHaveLength(1);

    const updated = await updateItem('demo-workspace', created.id, 'demo-owner', {
      title: 'Hello',
      notes: 'Done',
      status: 'done',
    });
    expect(updated.status).toBe('done');

    await deleteItem('demo-workspace', created.id, 'demo-owner');
    expect(await listItems('demo-workspace', 'demo-owner')).toHaveLength(0);
    expect(memoryDb.auditLogs.map((log) => log.action)).toEqual([
      'items.create',
      'items.update',
      'items.delete',
    ]);
  });
});

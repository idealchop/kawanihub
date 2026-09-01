/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { itemsCopy } from '../lib/items-copy';
import { useItems } from '../hooks/use-items';
import { ItemForm } from './item-form';

export function ItemList() {
  const { items, loading, error, createItem, updateItem, deleteItem } = useItems();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{itemsCopy.title}</h1>
        <p className="text-sm text-muted-foreground">{itemsCopy.description}</p>
      </div>

      <ItemForm onCreate={createItem} />

      {loading ? <p className="text-sm text-muted-foreground">Loading items…</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{itemsCopy.empty}</p>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.notes || 'No notes'}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{item.status}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await updateItem(item.id, {
                        title: item.title,
                        notes: item.notes,
                        status: item.status === 'open' ? 'done' : 'open',
                      });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Update failed.');
                    }
                  }}
                >
                  Toggle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await deleteItem(item.id);
                      toast.success('Item deleted.');
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Delete failed.');
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.notes || '—'}</td>
                <td className="px-4 py-3 capitalize">{item.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await updateItem(item.id, {
                            title: item.title,
                            notes: item.notes,
                            status: item.status === 'open' ? 'done' : 'open',
                          });
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Update failed.');
                        }
                      }}
                    >
                      Toggle
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        try {
                          await deleteItem(item.id);
                          toast.success('Item deleted.');
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Delete failed.');
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

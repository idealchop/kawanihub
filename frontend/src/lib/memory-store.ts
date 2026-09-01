/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 *
 * In-memory session store. Do not use localStorage for app state.
 */

type StoreValue = string | number | boolean | object | null;

const store = new Map<string, StoreValue>();

export const memoryStore = {
  get<T extends StoreValue>(key: string): T | undefined {
    return store.get(key) as T | undefined;
  },
  set(key: string, value: StoreValue): void {
    store.set(key, value);
  },
  delete(key: string): void {
    store.delete(key);
  },
  clear(): void {
    store.clear();
  },
};

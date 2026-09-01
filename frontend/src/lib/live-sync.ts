/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

export const liveSync = {
  publish(): void {
    listeners.forEach((fn) => fn());
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getDocumentsCopy } from '../lib/documents-copy';
import { createDocument, deleteDocument, listDocuments, updateDocument } from '../services/documents-api';
import type { DeskDocument, DocumentWriteInput } from '../types/document';

export function useDocuments() {
  const [documents, setDocuments] = useState<DeskDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDocuments(await listDocuments());
    } catch (err) {
      setError(err instanceof Error ? err.message : getDocumentsCopy().loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    const unsubscribe = liveSync.subscribe(() => {
      void refresh();
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  return { documents, loading, error, refresh, createDocument, updateDocument, deleteDocument };
}

export type { DocumentWriteInput };

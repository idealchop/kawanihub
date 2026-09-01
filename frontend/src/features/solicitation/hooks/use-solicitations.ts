/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getSolicitationCopy } from '../lib/solicitation-copy';
import {
  approveSolicitation,
  assignSolicitation,
  claimSolicitation,
  createSolicitation,
  downloadSolicitationReport,
  escalateSolicitation,
  expediteSolicitation,
  flagSolicitation,
  markReadyToClaim,
  listPersonHistory,
  listSolicitations,
  rejectSolicitation,
  requestMissingRequirements,
  reviewSolicitation,
  updateSolicitation,
} from '../services/solicitation-api';
import type { SolicitRole, Solicitation } from '../types/solicitation';

export function useSolicitations() {
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [deskRole, setDeskRole] = useState<SolicitRole>('admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSolicitations();
      setSolicitations(data.solicitations);
      setDeskRole(data.deskRole ?? 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : getSolicitationCopy().loadError);
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

  return {
    solicitations,
    deskRole,
    loading,
    error,
    refresh,
    createSolicitation,
    updateSolicitation,
    reviewSolicitation,
    approveSolicitation,
    markReadyToClaim,
    rejectSolicitation,
    claimSolicitation,
    assignSolicitation,
    requestMissingRequirements,
    escalateSolicitation,
    expediteSolicitation,
    flagSolicitation,
    listPersonHistory,
    downloadSolicitationReport,
  };
}

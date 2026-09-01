/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { liveSync } from '@/lib/live-sync';
import { getUsersCopy } from '../lib/users-copy';
import { createMember, deleteMember, getCurrentMember, listMembers, updateMember } from '../services/members-api';
import type { Member, MemberWriteInput } from '../types/member';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [current, setCurrent] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, me] = await Promise.all([listMembers(), getCurrentMember()]);
      setMembers(rows);
      setCurrent(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : getUsersCopy().loadError);
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

  return { members, current, loading, error, refresh, createMember, updateMember, deleteMember };
}

export function useCurrentMember(): { member: Member | null; loading: boolean } {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () =>
      getCurrentMember()
        .then((row) => {
          if (active) setMember(row);
        })
        .catch(() => {
          if (active) setMember(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

    const timer = window.setTimeout(load, 0);
    const unsubscribe = liveSync.subscribe(load);
    return () => {
      active = false;
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return { member, loading };
}

export type { MemberWriteInput };

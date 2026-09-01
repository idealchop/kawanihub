/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/config/app-config';
import {
  getDemoSession,
  resetPassword,
  signInWithEmail,
  signOutCurrentUser,
  signUpWithEmail,
} from '../services/auth-client';
import type { AuthSession } from '../types/auth-types';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    appConfig.demoMode ? (getDemoSession() ?? null) : null,
  );
  const [ready, setReady] = useState(appConfig.demoMode);

  useEffect(() => {
    if (appConfig.demoMode) {
      return;
    }

    let cancelled = false;
    void import('@/lib/firebase/auth').then(({ getFirebaseAuth }) =>
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        if (cancelled) return;
        const auth = getFirebaseAuth();
        if (!auth) {
          setReady(true);
          return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setSession(user ? { uid: user.uid, email: user.email ?? '' } : null);
          setReady(true);
        });
        return unsubscribe;
      }),
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const next = await signInWithEmail(username, password);
    setSession(next);
    return next;
  }, []);

  const signUp = useCallback(async (username: string, password: string) => {
    const next = await signUpWithEmail(username, password);
    setSession(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await signOutCurrentUser();
    setSession(null);
  }, []);

  return { session, ready, signIn, signUp, signOut, resetPassword };
}

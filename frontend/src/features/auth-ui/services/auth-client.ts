/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { appConfig } from '@/config/app-config';
import { memoryStore } from '@/lib/memory-store';
import { getAuthCopy } from '../lib/auth-copy';
import { isLocalAdmin, findDemoLogin, localCredentials } from '../lib/local-credentials';
import type { AuthSession } from '../types/auth-types';

const SESSION_KEY = 'demo.session';

function localSession(username: string, password: string): AuthSession {
  const login = findDemoLogin(username, password) ?? {
    uid: localCredentials.uid,
    email: localCredentials.email,
    username: localCredentials.username,
  };
  return {
    uid: login.uid,
    email: login.email,
    username: login.username,
  };
}

export async function signInWithEmail(username: string, password: string): Promise<AuthSession> {
  if (appConfig.demoMode) {
    if (!isLocalAdmin(username, password)) {
      throw new Error(getAuthCopy().invalidCredentials);
    }
    const session = localSession(username, password);
    memoryStore.set(SESSION_KEY, session);
    memoryStore.set('demo.email', session.email);
    return session;
  }

  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const { getFirebaseAuth } = await import('@/lib/firebase/auth');
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured.');
  const cred = await signInWithEmailAndPassword(auth, username, password);
  return { uid: cred.user.uid, email: cred.user.email ?? username };
}

export async function signUpWithEmail(username: string, password: string): Promise<AuthSession> {
  if (appConfig.demoMode) {
    return signInWithEmail(username, password);
  }

  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const { getFirebaseAuth } = await import('@/lib/firebase/auth');
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured.');
  const cred = await createUserWithEmailAndPassword(auth, username, password);
  return { uid: cred.user.uid, email: cred.user.email ?? username };
}

export async function resetPassword(email: string): Promise<void> {
  if (appConfig.demoMode) return;
  const { sendPasswordResetEmail } = await import('firebase/auth');
  const { getFirebaseAuth } = await import('@/lib/firebase/auth');
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not configured.');
  await sendPasswordResetEmail(auth, email);
}

export async function signOutCurrentUser(): Promise<void> {
  memoryStore.delete(SESSION_KEY);
  memoryStore.delete('demo.email');
  if (appConfig.demoMode) return;

  const { signOut } = await import('firebase/auth');
  const { getFirebaseAuth } = await import('@/lib/firebase/auth');
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

export function getDemoSession(): AuthSession | undefined {
  return memoryStore.get<AuthSession>(SESSION_KEY);
}

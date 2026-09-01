/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Temporary local webapp — skip Firebase Admin and Firestore.
export const demoMode = true;

export function initAdmin(): void {
  if (demoMode) return;
  if (getApps().length) return;
  initializeApp();
}

export function getAdminAuth() {
  initAdmin();
  return getAuth();
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { getAuth, type Auth } from 'firebase/auth';
import { getFirebaseApp } from './app';

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

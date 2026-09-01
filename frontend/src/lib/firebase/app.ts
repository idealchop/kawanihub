/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { appConfig } from '@/config/app-config';

export function getFirebaseApp(): FirebaseApp | null {
  if (appConfig.demoMode) return null;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  if (!config.apiKey || !config.projectId) {
    throw new Error('Firebase env is incomplete. Set NEXT_PUBLIC_FIREBASE_* or keep DEMO_MODE on.');
  }

  return getApps()[0] ?? initializeApp(config);
}

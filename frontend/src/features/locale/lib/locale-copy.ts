/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    language: 'Language',
    english: 'English',
    filipino: 'Filipino',
    signOut: 'Sign out',
    loading: 'Loading…',
    saving: 'Saving…',
    pleaseWait: 'Please wait…',
    previous: 'Previous',
    next: 'Next',
    welcomeBack: 'Welcome back.',
    signInFailed: 'Sign-in failed.',
    actionFailed: 'Something went wrong.',
    updateFailed: 'Could not update.',
    deleteFailed: 'Could not delete.',
    saveFailed: 'Could not save.',
    ownerLocked: 'The owner role cannot be changed here.',
  },
  fil: {
    language: 'Wika',
    english: 'English',
    filipino: 'Filipino',
    signOut: 'Mag-sign out',
    loading: 'Loading…',
    saving: 'Sine-save…',
    pleaseWait: 'Sandali…',
    previous: 'Nakaraan',
    next: 'Susunod',
    welcomeBack: 'Maligayang pagbabalik.',
    signInFailed: 'Hindi makapag-sign in.',
    actionFailed: 'May nangyaring mali.',
    updateFailed: 'Hindi na-update.',
    deleteFailed: 'Hindi mabura.',
    saveFailed: 'Hindi naitala.',
    ownerLocked: 'Hindi mababago ang owner role dito.',
  },
} as const;

export function getLocaleCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    title: 'Documents',
    description: 'Track clearances, permits, and other papers from received to released.',
    empty: 'No documents yet.',
    add: 'Add',
    titleLabel: 'Title',
    referenceLabel: 'Reference no.',
    requesterLabel: 'Requester',
    barangayLabel: 'Barangay',
    kindLabel: 'Type',
    dueLabel: 'Due date',
    notesLabel: 'Notes',
    loadError: 'Could not load documents.',
    created: 'Document saved.',
    updated: 'Document updated.',
    deleted: 'Document deleted.',
    nextStatus: 'Next status',
    delete: 'Delete',
    kinds: {
      request: 'Request',
      permit: 'Permit',
      certification: 'Certification',
      report: 'Report',
      other: 'Other',
    },
    statuses: {
      received: 'Received',
      in_review: 'In review',
      released: 'Released',
      returned: 'Returned',
    },
  },
  fil: {
    title: 'Documents',
    description: 'I-track ang clearance, permit, at iba pang papeles mula sa pagtanggap hanggang release.',
    empty: 'Wala pang dokumento.',
    add: 'Idagdag',
    titleLabel: 'Pamagat',
    referenceLabel: 'Reference no.',
    requesterLabel: 'Humiling',
    barangayLabel: 'Barangay',
    kindLabel: 'Uri',
    dueLabel: 'Due date',
    notesLabel: 'Tala',
    loadError: 'Hindi ma-load ang documents.',
    created: 'Naitala ang dokumento.',
    updated: 'Na-update ang dokumento.',
    deleted: 'Binura ang dokumento.',
    nextStatus: 'Susunod na status',
    delete: 'Burahin',
    kinds: {
      request: 'Request',
      permit: 'Permit',
      certification: 'Sertipikasyon',
      report: 'Report',
      other: 'Iba pa',
    },
    statuses: {
      received: 'Natanggap',
      in_review: 'Sinusuri',
      released: 'Nailabas',
      returned: 'Naisauli',
    },
  },
} as const;

export function getDocumentsCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}

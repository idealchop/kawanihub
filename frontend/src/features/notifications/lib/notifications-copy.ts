/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    title: 'Notifications',
    description: 'Alerts from solicitations, documents, events, and the team.',
    empty: 'No notifications.',
    add: 'Send',
    titleLabel: 'Title',
    bodyLabel: 'Message',
    kindLabel: 'Type',
    loadError: 'Could not load notifications.',
    created: 'Notification sent.',
    updated: 'Notification updated.',
    deleted: 'Notification deleted.',
    markRead: 'Mark as read',
    markUnread: 'Mark as unread',
    delete: 'Delete',
    read: 'Read',
    unread: 'New',
    kinds: {
      solicitation: 'Solicitation',
      document: 'Document',
      event: 'Event',
      system: 'System',
      user: 'User',
    },
  },
  fil: {
    title: 'Notifications',
    description: 'Abiso mula sa solicitation, dokumento, events, at koponan.',
    empty: 'Walang abiso.',
    add: 'Magpadala',
    titleLabel: 'Pamagat',
    bodyLabel: 'Mensahe',
    kindLabel: 'Uri',
    loadError: 'Hindi ma-load ang notifications.',
    created: 'Naipadala ang abiso.',
    updated: 'Na-update ang abiso.',
    deleted: 'Binura ang abiso.',
    markRead: 'Markahan bilang nabasa',
    markUnread: 'Markahan bilang hindi pa',
    delete: 'Burahin',
    read: 'Nabasa',
    unread: 'Bago',
    kinds: {
      solicitation: 'Solicitation',
      document: 'Dokumento',
      event: 'Event',
      system: 'System',
      user: 'User',
    },
  },
} as const;

export function getNotificationsCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}

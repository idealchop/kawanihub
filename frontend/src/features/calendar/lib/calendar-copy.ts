/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { type AppLocale, pickCopy } from '@/lib/locale';

const copy = {
  en: {
    title: 'Calendar',
    description: 'Meetings, outreach, and deadlines for the desk.',
    empty: 'No events this month.',
    add: 'Add',
    titleLabel: 'Title',
    startLabel: 'Starts',
    endLabel: 'Ends',
    locationLabel: 'Location',
    kindLabel: 'Type',
    notesLabel: 'Notes',
    loadError: 'Could not load the calendar.',
    created: 'Event saved.',
    updated: 'Event updated.',
    deleted: 'Event deleted.',
    delete: 'Delete',
    today: 'Today',
    kinds: {
      meeting: 'Meeting',
      outreach: 'Outreach',
      deadline: 'Deadline',
      other: 'Other',
    },
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  fil: {
    title: 'Calendar',
    description: 'Mga meeting, outreach, at deadline ng desk.',
    empty: 'Walang event sa buwang ito.',
    add: 'Idagdag',
    titleLabel: 'Pamagat',
    startLabel: 'Simula',
    endLabel: 'Tapos',
    locationLabel: 'Lugar',
    kindLabel: 'Uri',
    notesLabel: 'Tala',
    loadError: 'Hindi ma-load ang calendar.',
    created: 'Naitala ang event.',
    updated: 'Na-update ang event.',
    deleted: 'Binura ang event.',
    delete: 'Burahin',
    today: 'Ngayon',
    kinds: {
      meeting: 'Meeting',
      outreach: 'Outreach',
      deadline: 'Deadline',
      other: 'Iba pa',
    },
    weekdays: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
  },
} as const;

export function getCalendarCopy(locale?: AppLocale) {
  return pickCopy(copy, locale);
}

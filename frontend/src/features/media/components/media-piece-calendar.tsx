/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getLocaleCopy, useLocale } from '@/features/locale';
import type { Member } from '@/features/users/types/member';
import { cn } from '@/lib/utils';
import { contentTypeLabel } from '../lib/content-type-lookup';
import { formatPieceDate } from '../lib/format-piece-date';
import { ContentTypeChip } from './content-type-chip';
import { formatMediaOpenAge, getMediaCopy, withPieceName } from '../lib/media-copy';
import {
  formatMediaOpenDuration,
  pieceNeedsAttention,
  pieceOpenUntil,
} from '../lib/piece-attention';
import { StatusPill, StatusSwatch, statusChipStyle } from '../lib/piece-badge';
import {
  atDay,
  CALENDAR_SCOPES,
  dayKey,
  groupOccurrencesByDay,
  isSameMonth,
  isToday,
  occurrencesInPeriod,
  periodGrid,
  periodLabel,
  shiftAnchor,
  type CalendarOccurrence,
  type CalendarPlot,
  type CalendarScope,
} from '../lib/piece-calendar';
import { personNames } from '../lib/piece-person';
import type { MediaContentType } from '../types/media-content-type';
import type { MediaDateField, MediaPiece } from '../types/media-piece';

type MediaCopy = ReturnType<typeof getMediaCopy>;

function kindLabel(kind: MediaDateField, mediaCopy: MediaCopy): string {
  return kind === 'shoot' ? mediaCopy.shoot : mediaCopy.publish;
}

function pieceCalendarMeta(piece: MediaPiece, types: MediaContentType[], mediaCopy: MediaCopy) {
  const open = formatMediaOpenDuration(piece.createdAt, pieceOpenUntil(piece));
  return {
    typeName: contentTypeLabel(types, piece.type),
    attention: pieceNeedsAttention(piece),
    openLabel: open ? formatMediaOpenAge(mediaCopy, open) : '',
  };
}

function CalendarPieceChip({
  item,
  types,
  mediaCopy,
  onView,
}: {
  item: CalendarOccurrence;
  types: MediaContentType[];
  mediaCopy: MediaCopy;
  onView: (piece: MediaPiece) => void;
}) {
  const meta = pieceCalendarMeta(item.piece, types, mediaCopy);
  const kind = kindLabel(item.kind, mediaCopy);
  const line = [kind, meta.typeName, meta.openLabel].filter(Boolean).join(' · ');
  const hint = [item.piece.title, line, meta.attention ? mediaCopy.needsAttention : '']
    .filter(Boolean)
    .join(' · ');
  return (
    <button
      type="button"
      title={hint}
      className="flex w-full items-start gap-1 rounded px-1 py-1 text-left text-[11px] leading-tight hover:opacity-80"
      style={statusChipStyle(item.piece.status)}
      onClick={() => onView(item.piece)}
    >
      <StatusSwatch status={item.piece.status} className="mt-0.5 shrink-0" />
      <span className="min-w-0 space-y-0.5">
        <span className="block truncate font-medium">{item.piece.title}</span>
        <span className="block truncate opacity-80">
          <span className="font-semibold text-current">{kind}</span>
          {meta.typeName || meta.openLabel ? ` · ${[meta.typeName, meta.openLabel].filter(Boolean).join(' · ')}` : ''}
        </span>
        {meta.attention ? (
          <span className="block font-medium text-destructive">{mediaCopy.needsAttention}</span>
        ) : null}
      </span>
    </button>
  );
}

export function MediaPieceCalendar({
  pieces,
  types,
  members,
  plot,
  emptyTitle,
  emptyTypeName,
  onAddDay,
  onView,
  onEdit,
}: {
  pieces: MediaPiece[];
  types: MediaContentType[];
  members: Member[];
  plot?: CalendarPlot;
  emptyTitle?: string;
  emptyTypeName?: string;
  onAddDay: (date: string) => void;
  onView: (piece: MediaPiece) => void;
  onEdit: (piece: MediaPiece) => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [scope, setScope] = useState<CalendarScope>('month');
  const [anchor, setAnchor] = useState(() => atDay(new Date()));
  const days = useMemo(() => periodGrid(anchor, scope), [anchor, scope]);
  const byDay = useMemo(() => groupOccurrencesByDay(pieces, plot), [pieces, plot]);
  const periodItems = useMemo(
    () => occurrencesInPeriod(pieces, anchor, scope, plot),
    [pieces, anchor, scope, plot],
  );
  const weekdayHeaders =
    scope === 'day' ? [mediaCopy.weekdays[anchor.getDay()]] : mediaCopy.weekdays;
  const emptyMessage =
    emptyTitle ??
    (emptyTypeName
      ? withPieceName(
          scope === 'week'
            ? mediaCopy.emptyWeekType
            : scope === 'day'
              ? mediaCopy.emptyDayType
              : mediaCopy.emptyMonthType,
          emptyTypeName,
        )
      : scope === 'week'
        ? mediaCopy.emptyWeek
        : scope === 'day'
          ? mediaCopy.emptyDay
          : mediaCopy.emptyMonth);
  const cellMin =
    scope === 'day' ? 'min-h-[28rem]' : scope === 'week' ? 'min-h-[22rem]' : 'min-h-28';
  const chipMax =
    scope === 'day' ? 'max-h-[32rem]' : scope === 'week' ? 'max-h-[20rem]' : 'max-h-40';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAnchor((current) => shiftAnchor(current, scope, -1))}
          >
            {chrome.previous}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAnchor(atDay(new Date()))}>
            {mediaCopy.today}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAnchor((current) => shiftAnchor(current, scope, 1))}
          >
            {chrome.next}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-muted p-1">
            {CALENDAR_SCOPES.map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={scope === value ? 'default' : 'ghost'}
                className="h-7"
                onClick={() => setScope(value)}
              >
                {value === 'month'
                  ? mediaCopy.viewMonth
                  : value === 'week'
                    ? mediaCopy.viewWeek
                    : mediaCopy.viewDay}
              </Button>
            ))}
          </div>
          <p className="text-sm font-medium">{periodLabel(anchor, scope, locale)}</p>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border md:block">
        <div
          className={cn(
            'grid bg-muted/50 text-center text-xs font-medium text-muted-foreground',
            scope === 'day' ? 'grid-cols-1' : 'grid-cols-7',
          )}
        >
          {weekdayHeaders.map((day) => (
            <div key={day} className="px-2 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className={cn('grid', scope === 'day' ? 'grid-cols-1' : 'grid-cols-7')}>
          {days.map((day) => {
            const key = dayKey(day);
            const dayItems = byDay.get(key) ?? [];
            return (
              <div
                key={key}
                className={cn(
                  'border-t border-r p-1.5 last:border-r-0',
                  cellMin,
                  scope === 'month' && !isSameMonth(day, anchor) && 'bg-muted/30 text-muted-foreground',
                  isToday(day) && 'bg-primary/5',
                )}
              >
                <button
                  type="button"
                  className={cn(
                    'flex w-full rounded px-1 text-left text-xs hover:bg-accent',
                    isToday(day) && 'font-semibold text-primary',
                  )}
                  aria-label={withPieceName(mediaCopy.addOnDay, key)}
                  onClick={() => onAddDay(key)}
                >
                  {day.getDate()}
                </button>
                <div className={cn('mt-1 space-y-1 overflow-y-auto', chipMax)}>
                  {dayItems.map((item) => (
                    <CalendarPieceChip
                      key={`${item.piece.id}-${item.kind}`}
                      item={item}
                      types={types}
                      mediaCopy={mediaCopy}
                      onView={onView}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {periodItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {periodItems.map((item) => {
          const meta = pieceCalendarMeta(item.piece, types, mediaCopy);
          return (
            <Card
              key={`${item.piece.id}-${item.kind}`}
              className="cursor-pointer"
              onClick={(event) => {
                if (event.target instanceof Element && event.target.closest('button')) return;
                onView(item.piece);
              }}
            >
              <CardHeader className="space-y-1">
                <CardTitle>{item.piece.title}</CardTitle>
                <CardDescription>
                  {kindLabel(item.kind, mediaCopy)}
                  {` · ${formatPieceDate(item.date, locale)}`}
                  {` · ${personNames(members, item.piece.editorUids, mediaCopy.emptyField)}`}
                </CardDescription>
                {meta.attention || meta.openLabel ? (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                    {meta.attention ? (
                      <span className="font-medium text-destructive">{mediaCopy.needsAttention}</span>
                    ) : null}
                    {meta.openLabel ? <span className="text-muted-foreground">{meta.openLabel}</span> : null}
                  </p>
                ) : null}
              </CardHeader>
              <CardFooter className="flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <StatusPill status={item.piece.status} label={mediaCopy.statuses[item.piece.status]} />
                  <ContentTypeChip types={types} slug={item.piece.type} />
                </div>
                <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => onEdit(item.piece)}>
                  <Pencil className="size-3.5" />
                  {mediaCopy.edit}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

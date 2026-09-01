/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDataTableCopy } from '@/components/ui/lib/data-table-copy';
import { useLocale } from '@/features/locale';
import { formatPieceDate } from '../lib/format-piece-date';
import { getMediaCopy } from '../lib/media-copy';
import {
  DATE_PRESETS,
  dateRangeForPreset,
  type DatePreset,
  type DateRange,
  type PieceDateRole,
  type PiecePersonRole,
} from '../lib/piece-filters';
import { assignableMembers, personName } from '../lib/piece-person';
import type { MediaContentType } from '../types/media-content-type';
import { MEDIA_STATUSES, type MediaStatus } from '../types/media-piece';
import type { Member } from '@/features/users/types/member';
import { MemberMultiSelect } from './member-multi-select';

const ALL = '__all__';

function FilterCluster({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="flex h-9 items-center overflow-hidden rounded-md border border-input bg-transparent shadow-sm">
        {children}
      </div>
    </div>
  );
}

function ClusterDivider() {
  return <span className="h-5 w-px shrink-0 bg-border" />;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-md bg-teal-50 px-2 text-xs font-medium text-teal-800">
      {label}
      <button type="button" className="rounded-sm p-0.5 text-teal-700 hover:bg-teal-100" onClick={onRemove}>
        <X className="size-3" />
      </button>
    </span>
  );
}

export type MediaPieceFilterValues = {
  query: string;
  status: string;
  type: string;
  dateRole: PieceDateRole;
  datePreset: DatePreset | '';
  customFrom: string;
  customTo: string;
  personRole: PiecePersonRole;
  personUids: string[];
};

export const EMPTY_MEDIA_FILTERS: MediaPieceFilterValues = {
  query: '',
  status: '',
  type: '',
  dateRole: 'publish',
  datePreset: '',
  customFrom: '',
  customTo: '',
  personRole: 'editor',
  personUids: [],
};

export function mediaFilterRange(filters: MediaPieceFilterValues, now = new Date()): DateRange | null {
  return dateRangeForPreset(filters.datePreset, now, filters.customFrom, filters.customTo);
}

export function MediaPieceFilters({
  filters,
  types,
  members,
  hideTypeFilter,
  onChange,
}: {
  filters: MediaPieceFilterValues;
  types: MediaContentType[];
  members: Member[];
  hideTypeFilter?: boolean;
  onChange: (next: MediaPieceFilterValues) => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const tableCopy = getDataTableCopy(locale);
  const people = assignableMembers(members);
  const dateRange = mediaFilterRange(filters);
  const personRoleLabel =
    filters.personRole === 'editor'
      ? mediaCopy.editorLabel
      : filters.personRole === 'reviewer'
        ? mediaCopy.reviewerLabel
        : filters.personRole === 'anyone'
          ? mediaCopy.personAnyone
          : mediaCopy.deployedFilter;

  function datePresetLabel(preset: DatePreset): string {
    if (preset === 'today') return mediaCopy.dateToday;
    if (preset === 'yesterday') return mediaCopy.dateYesterday;
    if (preset === 'this_week') return mediaCopy.dateThisWeek;
    if (preset === 'last_week') return mediaCopy.dateLastWeek;
    if (preset === 'last_month') return mediaCopy.dateLastMonth;
    return mediaCopy.dateCustom;
  }

  function dateRoleLabel(): string {
    if (filters.dateRole === 'shoot') return mediaCopy.shoot;
    if (filters.dateRole === 'both') return mediaCopy.dateBoth;
    return mediaCopy.publish;
  }

  function patch(partial: Partial<MediaPieceFilterValues>) {
    onChange({ ...filters, ...partial });
  }

  const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
  if (filters.query.trim()) {
    chips.push({ id: 'search', label: filters.query.trim(), onRemove: () => patch({ query: '' }) });
  }
  if (filters.status) {
    chips.push({
      id: 'status',
      label: mediaCopy.statuses[filters.status as MediaStatus] ?? filters.status,
      onRemove: () => patch({ status: '' }),
    });
  }
  if (filters.type) {
    const name = types.find((row) => row.slug === filters.type)?.name ?? filters.type;
    chips.push({ id: 'type', label: name, onRemove: () => patch({ type: '' }) });
  }
  if (dateRange && filters.datePreset) {
    const field = dateRoleLabel();
    let label = filters.datePreset ? `${field} · ${datePresetLabel(filters.datePreset)}` : field;
    if (filters.datePreset === 'custom') {
      const from = formatPieceDate(dateRange.from, locale);
      const to = formatPieceDate(dateRange.to, locale);
      label = from === to ? `${field} · ${from}` : `${field} · ${from} – ${to}`;
    }
    chips.push({
      id: 'when',
      label,
      onRemove: () => patch({ datePreset: '', customFrom: '', customTo: '' }),
    });
  }
  for (const uid of filters.personUids) {
    chips.push({
      id: `who-${uid}`,
      label: `${personRoleLabel} · ${personName(people, uid, uid)}`,
      onRemove: () => patch({ personUids: filters.personUids.filter((item) => item !== uid) }),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[16rem] flex-1 space-y-2">
          <Label htmlFor="media-filter-search">{tableCopy.searchLabel}</Label>
          <div className="relative">
            <Input
              id="media-filter-search"
              value={filters.query}
              placeholder={tableCopy.searchPlaceholder}
              className="pr-8"
              onChange={(event) => patch({ query: event.target.value })}
            />
            {filters.query ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                aria-label={tableCopy.searchLabel}
                onClick={() => patch({ query: '' })}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="min-w-36 space-y-2">
          <Label htmlFor="media-filter-status">{mediaCopy.statusLabel}</Label>
          <Select value={filters.status || ALL} onValueChange={(value) => patch({ status: value === ALL ? '' : value })}>
            <SelectTrigger id="media-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{tableCopy.allFilter}</SelectItem>
              {MEDIA_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {mediaCopy.statuses[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hideTypeFilter ? null : (
          <div className="min-w-36 space-y-2">
            <Label htmlFor="media-filter-type">{mediaCopy.typeLabel}</Label>
            <Select value={filters.type || ALL} onValueChange={(value) => patch({ type: value === ALL ? '' : value })}>
              <SelectTrigger id="media-filter-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{tableCopy.allFilter}</SelectItem>
                {types.map((row) => (
                  <SelectItem key={row.slug} value={row.slug}>
                    {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <FilterCluster label={mediaCopy.whenLabel} htmlFor="media-filter-when">
          <Select value={filters.dateRole} onValueChange={(value) => patch({ dateRole: value as PieceDateRole })}>
            <SelectTrigger
              className="h-9 w-[7.5rem] rounded-none border-0 shadow-none focus:ring-0"
              aria-label={mediaCopy.whenLabel}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shoot">{mediaCopy.shoot}</SelectItem>
              <SelectItem value="publish">{mediaCopy.publish}</SelectItem>
              <SelectItem value="both">{mediaCopy.dateBoth}</SelectItem>
            </SelectContent>
          </Select>
          <ClusterDivider />
          <Select
            value={filters.datePreset || ALL}
            onValueChange={(value) => {
              const next = value === ALL ? '' : (value as DatePreset);
              patch({
                datePreset: next,
                customFrom: next === 'custom' ? filters.customFrom : '',
                customTo: next === 'custom' ? filters.customTo : '',
              });
            }}
          >
            <SelectTrigger
              id="media-filter-when"
              className="h-9 w-[9.75rem] rounded-none border-0 shadow-none focus:ring-0"
              aria-label={mediaCopy.whenLabel}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{tableCopy.allFilter}</SelectItem>
              {DATE_PRESETS.map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {datePresetLabel(preset)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.datePreset === 'custom' ? (
            <>
              <ClusterDivider />
              <Input
                type="date"
                aria-label={mediaCopy.dateFrom}
                className="h-9 w-[10.25rem] rounded-none border-0 shadow-none focus-visible:ring-0"
                value={filters.customFrom}
                onChange={(event) => patch({ customFrom: event.target.value })}
              />
              <ClusterDivider />
              <Input
                type="date"
                aria-label={mediaCopy.dateTo}
                className="h-9 w-[10.25rem] rounded-none border-0 shadow-none focus-visible:ring-0"
                value={filters.customTo}
                onChange={(event) => patch({ customTo: event.target.value })}
              />
            </>
          ) : null}
          {dateRange ? (
            <button
              type="button"
              className="px-2 text-muted-foreground hover:text-foreground"
              aria-label={mediaCopy.clearWhen}
              onClick={() => patch({ datePreset: '', customFrom: '', customTo: '' })}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </FilterCluster>
        <FilterCluster label={mediaCopy.whoLabel} htmlFor="media-filter-person">
          <Select
            value={filters.personRole}
            onValueChange={(value) => patch({ personRole: value as PiecePersonRole })}
          >
            <SelectTrigger
              className="h-9 w-[8.75rem] rounded-none border-0 shadow-none focus:ring-0"
              aria-label={mediaCopy.whoLabel}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">{mediaCopy.editorLabel}</SelectItem>
              <SelectItem value="reviewer">{mediaCopy.reviewerLabel}</SelectItem>
              <SelectItem value="deployed">{mediaCopy.deployedFilter}</SelectItem>
              <SelectItem value="anyone">{mediaCopy.personAnyone}</SelectItem>
            </SelectContent>
          </Select>
          <ClusterDivider />
          <MemberMultiSelect
            id="media-filter-person"
            label={mediaCopy.personLabel}
            people={people}
            value={filters.personUids}
            onChange={(personUids) => patch({ personUids })}
            emptyLabel={tableCopy.allFilter}
            hideLabel
            embedded
            commitOnClose
            className="min-w-[12rem] flex-1"
          />
          {filters.personUids.length > 0 ? (
            <button
              type="button"
              className="px-2 text-muted-foreground hover:text-foreground"
              aria-label={mediaCopy.clearWho}
              onClick={() => patch({ personUids: [] })}
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </FilterCluster>
      </div>
      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border bg-background px-4 py-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{tableCopy.showingFilters}</span>
            {chips.map((chip) => (
              <FilterChip key={chip.id} label={chip.label} onRemove={chip.onRemove} />
            ))}
          </div>
          <button
            type="button"
            className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => onChange(EMPTY_MEDIA_FILTERS)}
          >
            {tableCopy.clearFilters}
          </button>
        </div>
      ) : null}
    </div>
  );
}

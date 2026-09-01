/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Eye, History, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/features/locale';
import type { Member } from '@/features/users/types/member';
import { formatPieceDate, linkLabel } from '../lib/format-piece-date';
import { ContentTypeChip } from './content-type-chip';
import { formatMediaOpenAge, getMediaCopy } from '../lib/media-copy';
import { formatMediaOpenDuration, pieceNeedsAttention, pieceOpenUntil } from '../lib/piece-attention';
import { assignableMembers, personNames } from '../lib/piece-person';
import type { MediaContentType } from '../types/media-content-type';
import { pieceLinks, type MediaPiece, type MediaPieceWriteInput } from '../types/media-piece';
import { MemberMultiSelect } from './member-multi-select';
import { MediaStatusSelect } from './media-status-select';

type PiecePatch = Pick<MediaPieceWriteInput, 'editorUids' | 'reviewerUids' | 'deployedUids' | 'status'>;

function detailsWhen(row: MediaPiece, mediaCopy: ReturnType<typeof getMediaCopy>, locale: string): string {
  const parts: string[] = [];
  if (row.shootDate) parts.push(`${mediaCopy.shoot} ${formatPieceDate(row.shootDate, locale)}`);
  if (row.publishDate) parts.push(`${mediaCopy.publish} ${formatPieceDate(row.publishDate, locale)}`);
  return parts.join(' · ');
}

function DetailsBody({
  row,
  types,
  mediaCopy,
  locale,
}: {
  row: MediaPiece;
  types: MediaContentType[];
  mediaCopy: ReturnType<typeof getMediaCopy>;
  locale: string;
}) {
  const when = detailsWhen(row, mediaCopy, locale);
  const attention = pieceNeedsAttention(row);
  const open = formatMediaOpenDuration(row.createdAt, pieceOpenUntil(row));
  const openLabel = open ? formatMediaOpenAge(mediaCopy, open) : '';
  return (
    <div className="min-w-0 space-y-1">
      <p className="truncate font-medium leading-tight">{row.title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <ContentTypeChip types={types} slug={row.type} />
        {pieceLinks(row).map((href) => (
          <a
            key={href}
            href={href}
            className="text-xs text-primary underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {linkLabel(href)}
          </a>
        ))}
      </div>
      {when ? <p className="truncate text-xs text-muted-foreground">{when}</p> : null}
      {attention || openLabel ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          {attention ? <span className="font-medium text-destructive">{mediaCopy.needsAttention}</span> : null}
          {openLabel ? <span className="text-muted-foreground">{openLabel}</span> : null}
        </p>
      ) : null}
    </div>
  );
}

function PeopleCell({
  id,
  label,
  people,
  value,
  emptyLabel,
  hideLabel,
  onChange,
}: {
  id: string;
  label: string;
  people: Member[];
  value: string[];
  emptyLabel: string;
  hideLabel?: boolean;
  onChange: (uids: string[]) => void;
}) {
  return (
    <MemberMultiSelect
      id={id}
      label={label}
      people={people}
      value={value}
      emptyLabel={emptyLabel}
      hideLabel={hideLabel}
      compact
      commitOnClose
      onChange={onChange}
    />
  );
}

export function MediaPieceTable({
  pieces,
  types,
  members,
  emptyTitle,
  onView,
  onEdit,
  onHistory,
  onDelete,
  onPatch,
}: {
  pieces: MediaPiece[];
  types: MediaContentType[];
  members: Member[];
  emptyTitle?: string;
  onView: (piece: MediaPiece) => void;
  onEdit: (piece: MediaPiece) => void;
  onHistory: (piece: MediaPiece) => void;
  onDelete: (piece: MediaPiece) => void;
  onPatch: (piece: MediaPiece, patch: PiecePatch) => void;
}) {
  const { locale } = useLocale();
  const mediaCopy = getMediaCopy(locale);
  const people = assignableMembers(members);

  const columns: DataTableColumn<MediaPiece>[] = [
    {
      id: 'details',
      header: mediaCopy.detailsLabel,
      accessor: (row) =>
        `${row.title} ${row.type} ${row.shootDate} ${row.publishDate} ${row.caption} ${row.episode} ${pieceNeedsAttention(row) ? mediaCopy.needsAttention : ''}`,
      sortable: true,
      className: 'align-middle',
      render: (row) => <DetailsBody row={row} types={types} mediaCopy={mediaCopy} locale={locale} />,
    },
    {
      id: 'editor',
      header: mediaCopy.editorLabel,
      accessor: (row) => personNames(members, row.editorUids, ''),
      className: 'w-[10.5rem] min-w-[10rem] align-middle',
      headerClassName: 'w-[10.5rem] min-w-[10rem]',
      render: (row) => (
        <PeopleCell
          id={`media-row-editor-${row.id}`}
          label={`${mediaCopy.editorLabel}: ${row.title}`}
          people={people}
          value={row.editorUids}
          emptyLabel={mediaCopy.emptyField}
          hideLabel
          onChange={(editorUids) => onPatch(row, { editorUids })}
        />
      ),
    },
    {
      id: 'reviewer',
      header: mediaCopy.reviewerLabel,
      accessor: (row) => personNames(members, row.reviewerUids, ''),
      className: 'w-[10.5rem] min-w-[10rem] align-middle',
      headerClassName: 'w-[10.5rem] min-w-[10rem]',
      render: (row) => (
        <PeopleCell
          id={`media-row-reviewer-${row.id}`}
          label={`${mediaCopy.reviewerLabel}: ${row.title}`}
          people={people}
          value={row.reviewerUids}
          emptyLabel={mediaCopy.emptyField}
          hideLabel
          onChange={(reviewerUids) => onPatch(row, { reviewerUids })}
        />
      ),
    },
    {
      id: 'deployed',
      header: mediaCopy.deployedLabel,
      accessor: (row) => personNames(members, row.deployedUids, ''),
      className: 'w-[10.5rem] min-w-[10rem] align-middle',
      headerClassName: 'w-[10.5rem] min-w-[10rem]',
      render: (row) => (
        <PeopleCell
          id={`media-row-deployed-${row.id}`}
          label={`${mediaCopy.deployedLabel}: ${row.title}`}
          people={people}
          value={row.deployedUids}
          emptyLabel={mediaCopy.emptyField}
          hideLabel
          onChange={(deployedUids) => onPatch(row, { deployedUids })}
        />
      ),
    },
    {
      id: 'status',
      header: mediaCopy.statusLabel,
      accessor: (row) => row.status,
      className: 'w-[12.5rem] min-w-[12.5rem] align-middle',
      headerClassName: 'w-[12.5rem] min-w-[12.5rem]',
      render: (row) => (
        <MediaStatusSelect
          id={`media-row-status-${row.id}`}
          label={`${mediaCopy.statusLabel}: ${row.title}`}
          value={row.status}
          labels={mediaCopy.statuses}
          onChange={(status) => onPatch(row, { status })}
        />
      ),
    },
  ];

  function rowActions(row: MediaPiece) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={`${mediaCopy.openActions}: ${row.title}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2" onSelect={() => onView(row)}>
            <Eye className="size-4" />
            {mediaCopy.view}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onSelect={() => onEdit(row)}>
            <Pencil className="size-4" />
            {mediaCopy.edit}
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onSelect={() => onHistory(row)}>
            <History className="size-4" />
            {mediaCopy.history}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={() => onDelete(row)}>
            <Trash2 className="size-4" />
            {mediaCopy.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DataTable
      rows={pieces}
      columns={[
        ...columns,
        {
          id: 'actions',
          header: mediaCopy.actions,
          accessor: (row) => row.id,
          className: 'w-12 text-right align-middle',
          headerClassName: 'w-12 text-right',
          render: (row) => rowActions(row),
        },
      ]}
      getRowId={(row) => row.id}
      pageSize={10}
      hideToolbar
      emptyTitle={emptyTitle ?? mediaCopy.empty}
      onRowClick={onView}
      renderCard={(row) => (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
            <DetailsBody row={row} types={types} mediaCopy={mediaCopy} locale={locale} />
            {rowActions(row)}
          </CardHeader>
          <CardFooter className="flex-col items-stretch gap-3">
            <div className="grid gap-3">
              <PeopleCell
                id={`media-card-editor-${row.id}`}
                label={mediaCopy.editorLabel}
                people={people}
                value={row.editorUids}
                emptyLabel={mediaCopy.emptyField}
                onChange={(editorUids) => onPatch(row, { editorUids })}
              />
              <PeopleCell
                id={`media-card-reviewer-${row.id}`}
                label={mediaCopy.reviewerLabel}
                people={people}
                value={row.reviewerUids}
                emptyLabel={mediaCopy.emptyField}
                onChange={(reviewerUids) => onPatch(row, { reviewerUids })}
              />
              <PeopleCell
                id={`media-card-deployed-${row.id}`}
                label={mediaCopy.deployedLabel}
                people={people}
                value={row.deployedUids}
                emptyLabel={mediaCopy.emptyField}
                onChange={(deployedUids) => onPatch(row, { deployedUids })}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <MediaStatusSelect
                id={`media-card-status-${row.id}`}
                label={`${mediaCopy.statusLabel}: ${row.title}`}
                value={row.status}
                labels={mediaCopy.statuses}
                onChange={(status) => onPatch(row, { status })}
              />
              <ContentTypeChip types={types} slug={row.type} />
            </div>
          </CardFooter>
        </Card>
      )}
    />
  );
}

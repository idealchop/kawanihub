/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { StatusSwatch, statusBadgeClass } from '../lib/piece-badge';
import { MEDIA_STATUSES, type MediaStatus } from '../types/media-piece';

const OUTCOME_STATUSES: MediaStatus[] = ['published', 'not_published'];

export function MediaStatusSelect({
  id,
  label,
  value,
  labels,
  onChange,
}: {
  id: string;
  label: string;
  value: MediaStatus;
  labels: Record<MediaStatus, string>;
  onChange: (status: MediaStatus) => void;
}) {
  return (
    <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            id={id}
            type="button"
            aria-label={label}
            className={cn(
              'max-w-full cursor-pointer gap-1.5 border-0 shadow-none transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              statusBadgeClass(value),
            )}
          >
            <StatusSwatch status={value} />
            <span className="truncate">{labels[value]}</span>
            <ChevronDown className="size-3 shrink-0 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[15rem] rounded-xl p-1.5">
          {MEDIA_STATUSES.map((key) => (
            <StatusOption
              key={key}
              status={key}
              label={labels[key]}
              selected={key === value}
              showDividerBefore={key === OUTCOME_STATUSES[0]}
              onSelect={() => {
                if (key !== value) onChange(key);
              }}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function StatusOption({
  status,
  label,
  selected,
  showDividerBefore,
  onSelect,
}: {
  status: MediaStatus;
  label: string;
  selected: boolean;
  showDividerBefore: boolean;
  onSelect: () => void;
}) {
  return (
    <>
      {showDividerBefore ? <DropdownMenuSeparator className="my-1.5" /> : null}
      <DropdownMenuItem
        className={cn('gap-2.5 rounded-md px-2.5 py-2', selected && 'bg-accent/70')}
        onSelect={onSelect}
      >
        <StatusSwatch status={status} />
        <span className="flex-1 text-sm">{label}</span>
        <Check className={cn('size-3.5 shrink-0 text-muted-foreground', selected ? 'opacity-100' : 'opacity-0')} />
      </DropdownMenuItem>
    </>
  );
}

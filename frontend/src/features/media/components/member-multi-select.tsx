/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Member } from '@/features/users/types/member';
import { cn } from '@/lib/utils';
import { personNames, sameUids } from '../lib/piece-person';

export function MemberMultiSelect({
  id,
  label,
  people,
  value,
  onChange,
  emptyLabel,
  className,
  hideLabel,
  compact,
  commitOnClose,
  embedded,
}: {
  id: string;
  label: string;
  people: Member[];
  value: string[];
  onChange: (uids: string[]) => void;
  emptyLabel: string;
  className?: string;
  hideLabel?: boolean;
  compact?: boolean;
  commitOnClose?: boolean;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const current = commitOnClose && open ? draft : value;
  const summary = personNames(people, current, '');

  function toggle(uid: string, checked: boolean) {
    const next = checked ? [...current, uid] : current.filter((item) => item !== uid);
    if (commitOnClose) setDraft(next);
    else onChange(next);
  }

  function onOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value);
    } else if (commitOnClose && !sameUids(draft, value)) {
      onChange(draft);
    }
    setOpen(nextOpen);
  }

  return (
    <div
      className={cn(!hideLabel && 'space-y-2', className)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {hideLabel ? null : <Label htmlFor={id}>{label}</Label>}
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-label={label}
            className={cn(
              'w-full justify-between border-input bg-transparent px-3 font-normal shadow-sm hover:bg-transparent',
              compact ? 'h-7 max-w-full gap-1 rounded-md px-2 text-xs shadow-none' : 'h-10',
              embedded && 'h-9 rounded-none border-0 shadow-none hover:bg-transparent',
            )}
          >
            <span className={cn('truncate', !summary && 'text-muted-foreground')}>{summary || emptyLabel}</span>
            <ChevronDown className={cn('shrink-0 opacity-50', compact ? 'size-3.5' : 'size-4')} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-60 min-w-[16rem] overflow-y-auto">
          {people.map((member) => {
            const checked = current.includes(member.uid);
            return (
              <DropdownMenuItem
                key={member.uid}
                className="gap-2"
                onSelect={(event) => {
                  event.preventDefault();
                  toggle(member.uid, !checked);
                }}
              >
                <Checkbox checked={checked} className="pointer-events-none" />
                {member.displayName}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

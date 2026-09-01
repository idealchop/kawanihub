/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { getUsersCopy, withMemberName } from '../lib/users-copy';
import type { Member } from '../types/member';

export function DeleteMemberDialog({
  member,
  open,
  onOpenChange,
  onDelete,
}: {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (memberId: string) => Promise<unknown>;
}) {
  const { locale } = useLocale();
  const usersCopy = getUsersCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [pending, setPending] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setPending(false);
    onOpenChange(next);
  }

  async function confirmDelete() {
    if (!member || member.role === 'owner') return;
    setPending(true);
    try {
      await onDelete(member.id);
      toast.success(usersCopy.deleted);
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.deleteFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usersCopy.deleteTitle}</DialogTitle>
          <DialogDescription>
            {withMemberName(usersCopy.deleteDescription, member?.displayName ?? '')}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">{member?.email}</p>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            {usersCopy.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void confirmDelete()}
            disabled={pending || !member || member.role === 'owner'}
          >
            {pending ? chrome.saving : usersCopy.confirmDelete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

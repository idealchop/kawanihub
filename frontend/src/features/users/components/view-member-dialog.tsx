/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { useLocale } from '@/features/locale';
import { accessSummary } from '../lib/member-access';
import { getUsersCopy, withMemberName } from '../lib/users-copy';
import { MemberAccessFields } from './member-access-fields';
import type { Member } from '../types/member';

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}

export function ViewMemberDialog({
  member,
  open,
  onOpenChange,
  onEdit,
}: {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (member: Member) => void;
}) {
  const { locale } = useLocale();
  const usersCopy = getUsersCopy(locale);
  const ownerLocked = member?.role === 'owner';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {member ? (
          <>
            <DialogHeader>
              <DialogTitle>{usersCopy.viewTitle}</DialogTitle>
              <DialogDescription>{withMemberName(usersCopy.viewDescription, member.displayName)}</DialogDescription>
            </DialogHeader>
            <DialogBody className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{usersCopy.roles[member.role]}</Badge>
                <Badge variant="outline">{usersCopy.statuses[member.status]}</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField label={usersCopy.usernameLabel} value={`@${member.username}`} />
                <DetailField label={usersCopy.emailLabel} value={member.email} />
                <DetailField label={usersCopy.firstNameLabel} value={member.firstName} />
                <DetailField label={usersCopy.lastNameLabel} value={member.lastName} />
                <DetailField label={usersCopy.phoneLabel} value={member.phone} />
                <DetailField label={usersCopy.permissionsColumn} value={accessSummary(member, usersCopy)} />
              </div>
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">{usersCopy.managementLabel}</p>
                <MemberAccessFields
                  copy={usersCopy}
                  access={member.access}
                  readOnly
                  onChange={() => undefined}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {usersCopy.cancel}
              </Button>
              {!ownerLocked ? (
                <Button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(member);
                  }}
                >
                  <Pencil className="size-4" />
                  {usersCopy.edit}
                </Button>
              ) : null}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

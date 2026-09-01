/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
import { Eye, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type DataTableColumn, type DataTableFilter } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { getLocaleCopy, useLocale } from '@/features/locale';
import { DeleteMemberDialog } from './delete-member-dialog';
import { EditMemberDialog } from './edit-member-dialog';
import { InviteMemberDialog } from './invite-member-dialog';
import { ViewMemberDialog } from './view-member-dialog';
import { memberIsEnabled, statusAfterToggle } from '../lib/member-status';
import { accessSummary } from '../lib/member-access';
import { getUsersCopy } from '../lib/users-copy';
import { useMembers } from '../hooks/use-members';
import type { Member, MemberRole, MemberWriteInput } from '../types/member';

type MemberAction =
  | { type: 'invite' }
  | { type: 'view'; member: Member }
  | { type: 'edit'; member: Member }
  | { type: 'delete'; member: Member };

function permissionSummary(row: Member, usersCopy: ReturnType<typeof getUsersCopy>) {
  return accessSummary(row, usersCopy);
}

export function MemberList() {
  const { locale } = useLocale();
  const usersCopy = getUsersCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { members, loading, error, createMember, updateMember, deleteMember } = useMembers();
  const [action, setAction] = useState<MemberAction | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  async function setDeskAccess(row: Member, enabled: boolean) {
    if (row.role === 'owner') {
      toast.error(chrome.ownerLocked);
      return;
    }
    const status = statusAfterToggle(row.status, enabled);
    if (status === row.status) return;
    setStatusPendingId(row.id);
    try {
      const input: MemberWriteInput = {
        username: row.username,
        firstName: row.firstName,
        lastName: row.lastName,
        phone: row.phone,
        email: row.email,
        displayName: row.displayName,
        role: row.role,
        access: row.access,
        status,
        uid: row.uid,
      };
      await updateMember(row.id, input);
      toast.success(usersCopy.updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : chrome.updateFailed);
    } finally {
      setStatusPendingId(null);
    }
  }

  const columns: DataTableColumn<Member>[] = [
    {
      id: 'userDetails',
      header: usersCopy.userDetails,
      accessor: (row) => `${row.displayName} ${row.username} ${row.email} ${row.role}`,
      sortable: true,
      render: (row) => (
        <div className="min-w-0 space-y-1">
          <p className="font-medium leading-tight">{row.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">@{row.username}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          {row.phone ? <p className="truncate text-xs text-muted-foreground">{row.phone}</p> : null}
          <Badge>{usersCopy.roles[row.role]}</Badge>
        </div>
      ),
    },
    {
      id: 'permissions',
      header: usersCopy.permissionsColumn,
      accessor: (row) => permissionSummary(row, usersCopy),
      render: (row) => <span className="text-xs text-muted-foreground">{permissionSummary(row, usersCopy)}</span>,
    },
    {
      id: 'status',
      header: usersCopy.statusLabel,
      accessor: (row) => row.status,
      className: 'w-[7.5rem]',
      headerClassName: 'w-[7.5rem]',
      render: (row) => (
        <div onClick={(event) => event.stopPropagation()}>
          <StatusToggle
            row={row}
            pending={statusPendingId === row.id}
            usersCopy={usersCopy}
            onToggle={(enabled) => void setDeskAccess(row, enabled)}
          />
        </div>
      ),
    },
  ];

  const filters: DataTableFilter<Member>[] = [
    {
      id: 'role',
      label: usersCopy.roleLabel,
      options: (Object.keys(usersCopy.roles) as MemberRole[]).map((value) => ({
        value,
        label: usersCopy.roles[value],
      })),
      getValue: (row) => row.role,
    },
  ];

  function rowActions(row: Member) {
    const ownerLocked = row.role === 'owner';
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            aria-label={`${usersCopy.openActions}: ${row.displayName}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="gap-2" onSelect={() => setAction({ type: 'view', member: row })}>
            <Eye className="size-4" />
            {usersCopy.view}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            disabled={ownerLocked}
            onSelect={() => setAction({ type: 'edit', member: row })}
          >
            <Pencil className="size-4" />
            {usersCopy.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            disabled={ownerLocked}
            onSelect={() => setAction({ type: 'delete', member: row })}
          >
            <Trash2 className="size-4" />
            {usersCopy.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{usersCopy.title}</h1>
          <p className="text-sm text-muted-foreground">{usersCopy.description}</p>
        </div>
        <Button type="button" onClick={() => setAction({ type: 'invite' })}>
          <UserPlus />
          {usersCopy.invite}
        </Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">{chrome.loading}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && !error ? (
        <DataTable
          rows={members}
          columns={[
            ...columns,
            {
              id: 'actions',
              header: usersCopy.actions,
              accessor: (row) => row.id,
              className: 'w-12 text-right',
              headerClassName: 'w-12 text-right',
              render: (row) => rowActions(row),
            },
          ]}
          getRowId={(row) => row.id}
          searchValue={(row) =>
            `${row.displayName} ${row.username} ${row.email} ${row.phone} ${row.role} ${row.status}`
          }
          filters={filters}
          pageSize={10}
          emptyTitle={usersCopy.empty}
          onRowClick={(row) => setAction({ type: 'view', member: row })}
          renderCard={(row) => (
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                <div className="min-w-0 space-y-1">
                  <CardTitle>{row.displayName}</CardTitle>
                  <CardDescription>{row.email}</CardDescription>
                  <Badge>{usersCopy.roles[row.role]}</Badge>
                </div>
                {rowActions(row)}
              </CardHeader>
              <CardFooter className="flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{permissionSummary(row, usersCopy)}</span>
                <div onClick={(event) => event.stopPropagation()}>
                  <StatusToggle
                    row={row}
                    pending={statusPendingId === row.id}
                    usersCopy={usersCopy}
                    onToggle={(enabled) => void setDeskAccess(row, enabled)}
                  />
                </div>
              </CardFooter>
            </Card>
          )}
        />
      ) : null}

      <InviteMemberDialog
        open={action?.type === 'invite'}
        onOpenChange={(open) => setAction(open ? { type: 'invite' } : null)}
        onCreate={createMember}
      />
      <ViewMemberDialog
        member={action?.type === 'view' ? action.member : null}
        open={action?.type === 'view'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onEdit={(member) => setAction({ type: 'edit', member })}
      />
      <EditMemberDialog
        member={action?.type === 'edit' ? action.member : null}
        open={action?.type === 'edit'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onUpdate={updateMember}
      />
      <DeleteMemberDialog
        member={action?.type === 'delete' ? action.member : null}
        open={action?.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        onDelete={deleteMember}
      />
    </div>
  );
}

function StatusToggle({
  row,
  pending,
  usersCopy,
  onToggle,
}: {
  row: Member;
  pending: boolean;
  usersCopy: ReturnType<typeof getUsersCopy>;
  onToggle: (enabled: boolean) => void;
}) {
  const enabled = memberIsEnabled(row.status);
  const ownerLocked = row.role === 'owner';
  return (
    <div className="flex flex-col items-start gap-1">
      <Switch
        checked={enabled}
        disabled={ownerLocked || pending}
        onCheckedChange={onToggle}
        aria-label={`${row.displayName}: ${usersCopy.statuses[row.status]}`}
      />
      {row.status === 'invited' ? (
        <span className="text-[11px] text-muted-foreground">{usersCopy.statuses.invited}</span>
      ) : null}
    </div>
  );
}

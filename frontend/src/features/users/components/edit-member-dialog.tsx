/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getLocaleCopy, useLocale } from '@/features/locale';
import {
  assignableDomainsForActor,
  defaultAccessForRole,
  EMPTY_ACCESS,
  FULL_ADMIN_ACCESS,
  isFullAdminAccess,
  isOverallAdmin,
} from '../lib/member-access';
import { generateMemberPassword } from '../lib/generate-password';
import { getUsersCopy, withMemberName } from '../lib/users-copy';
import { MemberAccessFields } from './member-access-fields';
import { useCurrentMember } from '../hooks/use-members';
import { ASSIGNABLE_MEMBER_ROLES, type Member, type MemberAccess, type MemberRole, type MemberWriteInput } from '../types/member';

const EDIT_FORM_ID = 'edit-member-form';

function assignableRole(role: MemberRole): MemberRole {
  return role === 'owner' ? 'admin' : role;
}

function EditMemberForm({
  member,
  onUpdate,
  onClose,
}: {
  member: Member;
  onUpdate: (memberId: string, input: MemberWriteInput) => Promise<unknown>;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const usersCopy = getUsersCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { member: actor } = useCurrentMember();
  const assignableDomains = assignableDomainsForActor(actor);
  const roleOptions = (() => {
    const base = isOverallAdmin(actor)
      ? [...ASSIGNABLE_MEMBER_ROLES]
      : ASSIGNABLE_MEMBER_ROLES.filter((key) => key !== 'admin');
    if (member.role === 'admin' && !base.includes('admin')) {
      return ['admin', ...base] as MemberRole[];
    }
    return base as MemberRole[];
  })();
  const roleLocked = member.role === 'admin' && !isOverallAdmin(actor);

  const [username, setUsername] = useState(member.username);
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [phone, setPhone] = useState(member.phone);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState<MemberRole>(assignableRole(member.role));
  const [access, setAccess] = useState<MemberAccess>(member.access ?? defaultAccessForRole(member.role));
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setUsername(member.username);
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setPhone(member.phone);
    setEmail(member.email);
    setRole(assignableRole(member.role));
    setAccess(member.access ?? defaultAccessForRole(member.role));
    setPassword('');
    setPasswordTouched(false);
  }, [member]);

  useEffect(() => {
    if (role === 'admin' && isOverallAdmin(actor) && !isFullAdminAccess(member.access ?? EMPTY_ACCESS)) {
      return;
    }
    if (role === 'admin' && isOverallAdmin(actor)) {
      setAccess(FULL_ADMIN_ACCESS);
    }
  }, [role, actor, member.access]);

  function resolveAccess(): MemberAccess {
    if (role === 'admin' && isOverallAdmin(actor)) return FULL_ADMIN_ACCESS;
    if (isOverallAdmin(actor)) return access;
    const merged = { ...(member.access ?? EMPTY_ACCESS) };
    for (const domain of assignableDomains) {
      merged[domain] = access[domain];
    }
    return merged;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const input: MemberWriteInput = {
        username,
        firstName,
        lastName,
        phone,
        email,
        displayName: `${firstName} ${lastName}`.trim() || member.displayName,
        role,
        access: resolveAccess(),
        status: member.status,
        uid: member.uid,
      };
      if (passwordTouched && password) {
        input.password = password;
      }
      await onUpdate(member.id, input);
      toast.success(usersCopy.updated);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.updateFailed);
    } finally {
      setPending(false);
    }
  }

  const accessFieldsDisabled =
    role === 'admin' && isOverallAdmin(actor) && (isFullAdminAccess(access) || isFullAdminAccess(member.access ?? EMPTY_ACCESS));

  return (
    <>
      <DialogHeader>
        <DialogTitle>{usersCopy.editTitle}</DialogTitle>
        <DialogDescription>{withMemberName(usersCopy.editDescription, member.displayName)}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <form id={EDIT_FORM_ID} onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-member-username">{usersCopy.usernameLabel}</Label>
              <Input
                id="edit-member-username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-first-name">{usersCopy.firstNameLabel}</Label>
              <Input
                id="edit-member-first-name"
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-last-name">{usersCopy.lastNameLabel}</Label>
              <Input
                id="edit-member-last-name"
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-phone">{usersCopy.phoneLabel}</Label>
              <Input
                id="edit-member-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-email">{usersCopy.emailLabel}</Label>
              <Input
                id="edit-member-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-member-password">{usersCopy.resetPasswordLabel}</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-member-password"
                  readOnly
                  value={passwordTouched ? password : '••••••••••••'}
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={usersCopy.regeneratePassword}
                  onClick={() => {
                    setPassword(generateMemberPassword());
                    setPasswordTouched(true);
                  }}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{usersCopy.resetPasswordHint}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-member-role">{usersCopy.roleLabel}</Label>
              <Select value={role} onValueChange={(value) => setRole(value as MemberRole)} disabled={roleLocked}>
                <SelectTrigger id="edit-member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((key) => (
                    <SelectItem key={key} value={key}>
                      {usersCopy.roles[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">{usersCopy.managementLabel}</p>
            <MemberAccessFields
              copy={usersCopy}
              access={access}
              disabled={accessFieldsDisabled}
              assignableDomains={assignableDomains}
              onChange={setAccess}
            />
          </div>
        </form>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
          {usersCopy.cancel}
        </Button>
        <Button type="submit" form={EDIT_FORM_ID} disabled={pending}>
          {pending ? chrome.saving : usersCopy.save}
        </Button>
      </DialogFooter>
    </>
  );
}

export function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onUpdate,
}: {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (memberId: string, input: MemberWriteInput) => Promise<unknown>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {member ? (
          <EditMemberForm key={member.id} member={member} onUpdate={onUpdate} onClose={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

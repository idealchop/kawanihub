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
  FULL_ADMIN_ACCESS,
  isOverallAdmin,
} from '../lib/member-access';
import { generateMemberPassword } from '../lib/generate-password';
import { getUsersCopy } from '../lib/users-copy';
import { MemberAccessFields } from './member-access-fields';
import { useCurrentMember } from '../hooks/use-members';
import { ASSIGNABLE_MEMBER_ROLES, type MemberAccess, type MemberRole, type MemberWriteInput } from '../types/member';

const INVITE_FORM_ID = 'invite-member-form';

export function InviteMemberDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: MemberWriteInput) => Promise<{ temporaryPassword?: string }>;
}) {
  const { locale } = useLocale();
  const usersCopy = getUsersCopy(locale);
  const chrome = getLocaleCopy(locale);
  const { member: actor } = useCurrentMember();
  const assignableDomains = assignableDomainsForActor(actor);
  const roleOptions = isOverallAdmin(actor)
    ? ASSIGNABLE_MEMBER_ROLES
    : ASSIGNABLE_MEMBER_ROLES.filter((key) => key !== 'admin');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(() => generateMemberPassword());
  const [role, setRole] = useState<MemberRole>('member');
  const [access, setAccess] = useState<MemberAccess>(defaultAccessForRole('member'));
  const [pending, setPending] = useState(false);

  function resetForm() {
    setUsername('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setPassword(generateMemberPassword());
    setRole('member');
    setAccess(defaultAccessForRole('member'));
    setPending(false);
  }

  useEffect(() => {
    if (role === 'admin' && isOverallAdmin(actor)) {
      setAccess(defaultAccessForRole('admin'));
      return;
    }
    setAccess(defaultAccessForRole(role));
  }, [role, actor]);

  function resolveAccess(): MemberAccess {
    if (role === 'admin' && isOverallAdmin(actor)) return FULL_ADMIN_ACCESS;
    if (assignableDomains.length === 0) return access;
    const scoped = defaultAccessForRole(role);
    for (const domain of assignableDomains) {
      scoped[domain] = access[domain];
    }
    return scoped;
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await onCreate({
        username,
        firstName,
        lastName,
        phone,
        email,
        role,
        access: resolveAccess(),
        password,
        status: 'invited',
      });
      toast.success(
        result.temporaryPassword
          ? usersCopy.createdWithPassword(result.temporaryPassword)
          : usersCopy.created,
      );
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.saveFailed);
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{usersCopy.inviteTitle}</DialogTitle>
          <DialogDescription>{usersCopy.inviteDescription}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id={INVITE_FORM_ID} onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="member-username">{usersCopy.usernameLabel}</Label>
                <Input
                  id="member-username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-first-name">{usersCopy.firstNameLabel}</Label>
                <Input
                  id="member-first-name"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-last-name">{usersCopy.lastNameLabel}</Label>
                <Input
                  id="member-last-name"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-phone">{usersCopy.phoneLabel}</Label>
                <Input
                  id="member-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">{usersCopy.emailLabel}</Label>
                <Input
                  id="member-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="member-password">{usersCopy.passwordLabel}</Label>
                <div className="flex gap-2">
                  <Input id="member-password" readOnly value={password} className="font-mono" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={usersCopy.regeneratePassword}
                    onClick={() => setPassword(generateMemberPassword())}
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{usersCopy.passwordHint}</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="member-role">{usersCopy.roleLabel}</Label>
                <Select value={role} onValueChange={(value) => setRole(value as MemberRole)}>
                  <SelectTrigger id="member-role">
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
                disabled={role === 'admin' && isOverallAdmin(actor)}
                assignableDomains={assignableDomains}
                onChange={setAccess}
              />
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            {usersCopy.cancel}
          </Button>
          <Button type="submit" form={INVITE_FORM_ID} disabled={pending}>
            {pending ? chrome.saving : usersCopy.add}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

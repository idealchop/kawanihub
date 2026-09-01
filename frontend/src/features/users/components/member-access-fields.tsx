/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MemberAccess } from '../types/member';
import type { ManagementDomain } from '../lib/member-access';
import type { getUsersCopy } from '../lib/users-copy';

type UsersCopy = ReturnType<typeof getUsersCopy>;

function AccessSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const DOMAIN_TAB_LABEL: Record<ManagementDomain, keyof UsersCopy> = {
  media: 'media',
  solicitation: 'solicitation',
  assistant: 'assistant',
  legislative: 'legislative',
};

export function MemberAccessFields({
  copy,
  access,
  disabled,
  readOnly,
  assignableDomains,
  onChange,
}: {
  copy: UsersCopy;
  access: MemberAccess;
  disabled?: boolean;
  readOnly?: boolean;
  assignableDomains?: ManagementDomain[];
  onChange: (access: MemberAccess) => void;
}) {
  if (disabled) {
    return <p className="text-sm text-muted-foreground">{copy.adminAccessNote}</p>;
  }

  const domains = assignableDomains?.length ? assignableDomains : (['media', 'solicitation', 'assistant', 'legislative'] as const);
  const defaultTab = domains[0] ?? 'media';

  function labelForDomain(domain: ManagementDomain): string {
    const value = access[domain];
    if (value === 'none') return copy.accessNone;
    const key = `${domain}_${value}` as keyof UsersCopy;
    const label = copy[key];
    return typeof label === 'string' ? label : value;
  }

  function updateDomain<K extends ManagementDomain>(domain: K, value: MemberAccess[K]) {
    onChange({ ...access, [domain]: value });
  }

  if (readOnly) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {(['media', 'solicitation', 'assistant', 'legislative'] as const).map((domain) => (
          <div key={domain} className="rounded-lg border bg-muted/20 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{copy[DOMAIN_TAB_LABEL[domain]]}</p>
            <p className="mt-1 text-sm font-medium">{labelForDomain(domain)}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{copy.adminAccessNote}</p>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-4">
          {domains.map((domain) => (
            <TabsTrigger key={domain} value={domain}>
              {copy[DOMAIN_TAB_LABEL[domain]]}
            </TabsTrigger>
          ))}
        </TabsList>
        {domains.includes('media') ? (
          <TabsContent value="media" className="mt-3">
            <AccessSelect
              id="access-media"
              label={copy.media}
              value={access.media}
              options={[
                { value: 'none', label: copy.accessNone },
                { value: 'admin', label: copy.media_admin },
                { value: 'member', label: copy.media_member },
              ]}
              onChange={(value) => updateDomain('media', value as MemberAccess['media'])}
            />
          </TabsContent>
        ) : null}
        {domains.includes('solicitation') ? (
          <TabsContent value="solicitation" className="mt-3">
            <AccessSelect
              id="access-solicitation"
              label={copy.solicitation}
              value={access.solicitation}
              options={[
                { value: 'none', label: copy.accessNone },
                { value: 'admin', label: copy.solicitation_admin },
                { value: 'accountant', label: copy.solicitation_accountant },
                { value: 'reviewer', label: copy.solicitation_reviewer },
              ]}
              onChange={(value) => updateDomain('solicitation', value as MemberAccess['solicitation'])}
            />
          </TabsContent>
        ) : null}
        {domains.includes('assistant') ? (
          <TabsContent value="assistant" className="mt-3">
            <AccessSelect
              id="access-assistant"
              label={copy.assistant}
              value={access.assistant}
              options={[
                { value: 'none', label: copy.accessNone },
                { value: 'admin', label: copy.assistant_admin },
                { value: 'assistant', label: copy.assistant_assistant },
              ]}
              onChange={(value) => updateDomain('assistant', value as MemberAccess['assistant'])}
            />
          </TabsContent>
        ) : null}
        {domains.includes('legislative') ? (
          <TabsContent value="legislative" className="mt-3">
            <AccessSelect
              id="access-legislative"
              label={copy.legislative}
              value={access.legislative}
              options={[
                { value: 'none', label: copy.accessNone },
                { value: 'admin', label: copy.legislative_admin },
                { value: 'member', label: copy.legislative_member },
              ]}
              onChange={(value) => updateDomain('legislative', value as MemberAccess['legislative'])}
            />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { appConfig } from '@/config/app-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher, getLocaleCopy, useLocale } from '@/features/locale';
import { getAuthCopy } from '../lib/auth-copy';
import { useAuth } from '../hooks/use-auth';

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { locale } = useLocale();
  const authCopy = getAuthCopy(locale);
  const chrome = getLocaleCopy(locale);
  const [username, setUsername] = useState(appConfig.demoMode ? 'admin' : '');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      await signIn(username, password);
      toast.success(chrome.welcomeBack);
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : chrome.signInFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{authCopy.signInTitle}</h1>
          {appConfig.demoMode ? <p className="text-sm text-muted-foreground">{authCopy.demoHint}</p> : null}
        </div>
        <LanguageSwitcher id="login-language" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">{authCopy.usernameLabel}</Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{authCopy.passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? chrome.pleaseWait : authCopy.submitSignIn}
      </Button>
    </form>
  );
}

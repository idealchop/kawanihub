/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { waitlistCopy } from '../lib/waitlist-copy';
import { LandingNav } from './landing-nav';

export function WaitlistLanding() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    window.setTimeout(() => {
      toast.success(waitlistCopy.success);
      setEmail('');
      setPending(false);
    }, 400);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-10 md:py-16">
      <LandingNav />
      <section className="space-y-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{waitlistCopy.kicker}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{waitlistCopy.title}</h1>
        <p className="mx-auto max-w-lg text-muted-foreground">{waitlistCopy.body}</p>
        <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-md gap-3 text-left sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="waitlist-email">{waitlistCopy.emailLabel}</Label>
            <Input
              id="waitlist-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending} className="sm:mb-px">
            {pending ? 'Joining…' : waitlistCopy.submit}
          </Button>
        </form>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        {waitlistCopy.proof.map((item) => (
          <div key={item.label} className="rounded-xl border bg-card px-4 py-5 text-center">
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

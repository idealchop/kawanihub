/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand-mark';
import { CopyrightNotice } from '@/components/copyright-notice';
import { productTitle } from '@/config/brand';
import { LoginForm } from '@/features/auth-ui';

export const metadata: Metadata = {
  title: productTitle('Sign in'),
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <BrandMark />
      </div>
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>
      <CopyrightNotice className="mt-8" />
    </div>
  );
}

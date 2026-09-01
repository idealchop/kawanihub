/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { productTitle } from '@/config/brand';
import { PublicRequirementPage } from '@/features/solicitation/components/public-requirement-page';

export const metadata: Metadata = {
  title: productTitle('Request'),
  description: 'Naisumite ang solicitation. Pending for Review. Walang sign-in.',
};

export default async function SolicitPapersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicRequirementPage solicitationId={id} />;
}

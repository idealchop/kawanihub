/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { productTitle } from '@/config/brand';
import { PublicSolicitationPage } from '@/features/solicitation/components/public-solicitation-page';

export const metadata: Metadata = {
  title: productTitle('Claim'),
  description: 'I-claim ang na-approve na solicitation gamit ang unique code. Walang sign-in.',
};

export default function SolicitClaimPage() {
  return <PublicSolicitationPage mode="claim" />;
}

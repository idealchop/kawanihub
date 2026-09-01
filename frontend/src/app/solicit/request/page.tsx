/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { productTitle } from '@/config/brand';
import { PublicSolicitationPage } from '@/features/solicitation/components/public-solicitation-page';

export const metadata: Metadata = {
  title: productTitle('Request'),
  description: 'Mag-request ng solicitation. Walang sign-in.',
};

export default function SolicitRequestPage() {
  return <PublicSolicitationPage mode="request" />;
}

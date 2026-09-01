/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Metadata } from 'next';
import { productTitle } from '@/config/brand';
import { PublicSolicitHome } from '@/features/solicitation/components/public-solicit-home';

export const metadata: Metadata = {
  title: productTitle('Solicitation'),
  description: 'Serbisyo pampubliko. Mag-request o mag-claim ng solicitation. Walang sign-in.',
};

export default function SolicitPage() {
  return <PublicSolicitHome />;
}

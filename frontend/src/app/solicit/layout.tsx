/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { PublicSolicitShell } from '@/features/solicitation/components/public-solicit-shell';

export default function SolicitLayout({ children }: { children: React.ReactNode }) {
  return <PublicSolicitShell>{children}</PublicSolicitShell>;
}

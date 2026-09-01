/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Suspense } from 'react';
import { SolicitationList } from '@/features/solicitation';

export default function QueuePage() {
  return (
    <Suspense>
      <SolicitationList />
    </Suspense>
  );
}

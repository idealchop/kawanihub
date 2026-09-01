/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';

export const documentWriteSchema = z.object({
  title: z.string().min(1).max(120),
  referenceNo: z.string().max(40).optional().default(''),
  requester: z.string().min(1).max(80),
  barangay: z.string().max(80).optional().default(''),
  kind: z.enum(['request', 'permit', 'certification', 'report', 'other']).optional().default('request'),
  status: z.enum(['received', 'in_review', 'released', 'returned']).optional().default('received'),
  dueAt: z.string().max(40).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
});

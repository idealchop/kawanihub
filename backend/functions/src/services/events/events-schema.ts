/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';

export const eventWriteSchema = z.object({
  title: z.string().min(1).max(120),
  notes: z.string().max(2000).optional().default(''),
  startsAt: z.string().min(1).max(40),
  endsAt: z.string().min(1).max(40),
  location: z.string().max(120).optional().default(''),
  kind: z.enum(['meeting', 'outreach', 'deadline', 'other']).optional().default('meeting'),
});

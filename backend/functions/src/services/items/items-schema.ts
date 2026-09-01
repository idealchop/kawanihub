/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';

export const itemWriteSchema = z.object({
  title: z.string().min(1).max(120),
  notes: z.string().max(2000).optional().default(''),
  status: z.enum(['open', 'done']).optional().default('open'),
});

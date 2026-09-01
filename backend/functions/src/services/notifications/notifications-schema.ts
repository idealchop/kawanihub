/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';

export const notificationWriteSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(2000).optional().default(''),
  kind: z.enum(['solicitation', 'document', 'event', 'system', 'user']).optional().default('system'),
  read: z.boolean().optional().default(false),
});

export const notificationPatchSchema = z.object({
  read: z.boolean(),
});

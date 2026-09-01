/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';

export const workspaceWriteSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(40).regex(/^[a-z0-9-]+$/),
  themePrimary: z.string().optional(),
});

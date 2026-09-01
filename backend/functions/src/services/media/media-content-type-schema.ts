/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';
import { MEDIA_TYPE_ICONS, MEDIA_TYPE_STATUSES } from './media-content-type-types';

export const mediaContentTypeWriteSchema = z.object({
  name: z.string().min(1).max(40),
  hint: z.string().max(80).optional().default(''),
  icon: z.enum(MEDIA_TYPE_ICONS),
  status: z.enum(MEDIA_TYPE_STATUSES).optional().default('active'),
});

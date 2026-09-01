/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';
import { MEDIA_STATUSES } from './media-types';

const dateField = z
  .string()
  .max(10)
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Use YYYY-MM-DD');

const urlField = z.string().max(500).optional().default('');

export const mediaPieceWriteSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.string().min(1).max(60),
  status: z.enum(MEDIA_STATUSES).optional().default('not_started'),
  caption: z.string().max(8000).optional().default(''),
  editorUids: z.array(z.string().max(80)).max(20).optional(),
  reviewerUids: z.array(z.string().max(80)).max(20).optional(),
  editorUid: z.string().max(80).optional().default(''),
  reviewerUid: z.string().max(80).optional().default(''),
  personUid: z.string().max(80).optional().default(''),
  deployedUids: z.array(z.string().max(80)).max(20).optional(),
  shootDate: dateField.optional().default(''),
  publishDate: dateField.optional().default(''),
  driveUrl: urlField,
  fbUrl: urlField,
  link: urlField,
  episode: z.string().max(40).optional().default(''),
  subs: z.string().max(8000).optional().default(''),
});

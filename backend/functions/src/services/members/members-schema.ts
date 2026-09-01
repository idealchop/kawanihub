/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { z } from 'zod';
import { ASSIGNABLE_MEMBER_ROLES } from './members-types';

const accessSchema = z.object({
  media: z.enum(['admin', 'member', 'none']),
  solicitation: z.enum(['admin', 'accountant', 'reviewer', 'none']),
  assistant: z.enum(['admin', 'assistant', 'none']),
  legislative: z.enum(['admin', 'member', 'none']),
});

export const memberWriteSchema = z.object({
  username: z.string().min(2).max(40),
  firstName: z.string().min(1).max(40),
  lastName: z.string().min(1).max(40),
  phone: z.string().max(40).optional().default(''),
  email: z.string().email().max(120),
  displayName: z.string().min(1).max(80).optional(),
  role: z.enum([...ASSIGNABLE_MEMBER_ROLES, 'owner']).optional().default('member'),
  access: accessSchema.optional(),
  status: z.enum(['active', 'invited', 'disabled']).optional().default('active'),
  uid: z.string().max(80).optional().default(''),
  password: z.string().min(8).max(64).optional(),
});

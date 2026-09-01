/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function sendError(res: Response, error: unknown): void {
  if (error instanceof ZodError) {
    res.status(400).json({ message: error.issues[0]?.message ?? 'Invalid input' });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  const message = error instanceof Error ? error.message : 'Internal server error';
  res.status(500).json({ message });
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { NextFunction, Request, Response } from 'express';

export function requireWorkspace(req: Request, res: Response, next: NextFunction): void {
  const fromParams = req.params.workspaceId;
  const fromHeader = req.headers['x-workspace-id'];
  const workspaceId = fromParams || (typeof fromHeader === 'string' ? fromHeader : '');

  if (!workspaceId) {
    res.status(400).json({ message: 'X-Workspace-Id or :workspaceId is required' });
    return;
  }

  req.workspaceId = workspaceId;
  next();
}

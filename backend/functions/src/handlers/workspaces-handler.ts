/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { workspaceWriteSchema } from '../services/workspaces/workspaces-schema';
import { createWorkspace, listWorkspaces } from '../services/workspaces/workspaces-service';
import { sendError } from '../utils/errors';

export async function listWorkspacesHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const workspaces = await listWorkspaces(uid);
    res.json({ workspaces });
  } catch (error) {
    sendError(res, error);
  }
}

export async function createWorkspaceHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const input = workspaceWriteSchema.parse(req.body);
    const workspace = await createWorkspace(uid, input);
    res.status(201).json(workspace);
  } catch (error) {
    sendError(res, error);
  }
}

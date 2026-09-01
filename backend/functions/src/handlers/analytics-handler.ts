/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { getAnalytics } from '../services/analytics/analytics-service';
import { assertModuleAccess } from '../services/members/members-service';
import { sendError } from '../utils/errors';

export async function getAnalyticsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await assertModuleAccess(req.params.workspaceId, uid, 'dashboard', req.user?.email);
    const analytics = await getAnalytics(req.params.workspaceId, uid);
    res.json(analytics);
  } catch (error) {
    sendError(res, error);
  }
}

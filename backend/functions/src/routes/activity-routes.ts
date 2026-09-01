/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import { getActivityHandler, listActivityHandler } from '../handlers/activity-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listActivityHandler);
router.get('/:logId', getActivityHandler);

export default router;

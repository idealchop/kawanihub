/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import { getAnalyticsHandler } from '../handlers/analytics-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', getAnalyticsHandler);

export default router;

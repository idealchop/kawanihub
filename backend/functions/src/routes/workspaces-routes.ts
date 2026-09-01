/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import { createWorkspaceHandler, listWorkspacesHandler } from '../handlers/workspaces-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/', validateFirebaseIdToken, listWorkspacesHandler);
router.post('/', validateFirebaseIdToken, createWorkspaceHandler);

export default router;

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  createEventHandler,
  deleteEventHandler,
  getEventHandler,
  listEventsHandler,
  updateEventHandler,
} from '../handlers/events-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listEventsHandler);
router.get('/:eventId', getEventHandler);
router.post('/', createEventHandler);
router.put('/:eventId', updateEventHandler);
router.delete('/:eventId', deleteEventHandler);

export default router;

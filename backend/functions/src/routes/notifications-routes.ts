/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  createNotificationHandler,
  deleteNotificationHandler,
  getNotificationHandler,
  listNotificationsHandler,
  updateNotificationHandler,
} from '../handlers/notifications-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listNotificationsHandler);
router.get('/:notificationId', getNotificationHandler);
router.post('/', createNotificationHandler);
router.put('/:notificationId', updateNotificationHandler);
router.delete('/:notificationId', deleteNotificationHandler);

export default router;

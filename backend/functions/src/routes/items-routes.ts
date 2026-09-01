/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  createItemHandler,
  deleteItemHandler,
  getItemHandler,
  listItemsHandler,
  updateItemHandler,
} from '../handlers/items-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listItemsHandler);
router.get('/:itemId', getItemHandler);
router.post('/', createItemHandler);
router.put('/:itemId', updateItemHandler);
router.delete('/:itemId', deleteItemHandler);

export default router;

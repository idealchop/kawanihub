/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  createMediaContentTypeHandler,
  deleteMediaContentTypeHandler,
  getMediaContentTypeHandler,
  listMediaContentTypesHandler,
  updateMediaContentTypeHandler,
} from '../handlers/media-content-type-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listMediaContentTypesHandler);
router.get('/:typeId', getMediaContentTypeHandler);
router.post('/', createMediaContentTypeHandler);
router.put('/:typeId', updateMediaContentTypeHandler);
router.delete('/:typeId', deleteMediaContentTypeHandler);

export default router;

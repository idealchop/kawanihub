/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  publicCatalogHandler,
  publicClaimSolicitationHandler,
  publicCreateSolicitationHandler,
  publicGetSolicitationHandler,
  publicSubmitRequirementsHandler,
  publicTrackSolicitationHandler,
} from '../handlers/public-solicitations-handler';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(requireWorkspace);
router.get('/catalog', publicCatalogHandler);
router.post('/track', publicTrackSolicitationHandler);
router.post('/claim', publicClaimSolicitationHandler);
router.post('/:solicitationId/requirements', publicSubmitRequirementsHandler);
router.get('/:solicitationId', publicGetSolicitationHandler);
router.post('/', publicCreateSolicitationHandler);

export default router;

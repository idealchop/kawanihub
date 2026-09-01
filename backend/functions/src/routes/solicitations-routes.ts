/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  approveSolicitationHandler,
  assignSolicitationHandler,
  claimSolicitationHandler,
  createSolicitationHandler,
  escalateSolicitationHandler,
  expediteSolicitationHandler,
  flagSolicitationHandler,
  getSolicitationHandler,
  historySolicitationsHandler,
  dueDiligenceSolicitationsHandler,
  markReadyToClaimHandler,
  listSolicitationsHandler,
  missingSolicitationHandler,
  rejectSolicitationHandler,
  reportSolicitationsHandler,
  reviewSolicitationHandler,
  updateSolicitationHandler,
} from '../handlers/solicitations-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listSolicitationsHandler);
router.get('/report', reportSolicitationsHandler);
router.get('/history', historySolicitationsHandler);
router.post('/claim', claimSolicitationHandler);
router.get('/:solicitationId', getSolicitationHandler);
router.get('/:solicitationId/due-diligence', dueDiligenceSolicitationsHandler);
router.post('/', createSolicitationHandler);
router.put('/:solicitationId', updateSolicitationHandler);
router.post('/:solicitationId/review', reviewSolicitationHandler);
router.post('/:solicitationId/approve', approveSolicitationHandler);
router.post('/:solicitationId/ready-to-claim', markReadyToClaimHandler);
router.post('/:solicitationId/reject', rejectSolicitationHandler);
router.post('/:solicitationId/assign', assignSolicitationHandler);
router.post('/:solicitationId/missing', missingSolicitationHandler);
router.post('/:solicitationId/escalate', escalateSolicitationHandler);
router.post('/:solicitationId/expedite', expediteSolicitationHandler);
router.post('/:solicitationId/flag', flagSolicitationHandler);

export default router;

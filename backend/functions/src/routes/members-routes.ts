/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  createMemberHandler,
  deleteMemberHandler,
  getCurrentMemberHandler,
  getMemberHandler,
  listMembersHandler,
  updateMemberHandler,
} from '../handlers/members-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listMembersHandler);
router.get('/me', getCurrentMemberHandler);
router.get('/:memberId', getMemberHandler);
router.post('/', createMemberHandler);
router.put('/:memberId', updateMemberHandler);
router.delete('/:memberId', deleteMemberHandler);

export default router;

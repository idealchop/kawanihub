/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  createDocumentHandler,
  deleteDocumentHandler,
  getDocumentHandler,
  listDocumentsHandler,
  updateDocumentHandler,
} from '../handlers/documents-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listDocumentsHandler);
router.get('/:documentId', getDocumentHandler);
router.post('/', createDocumentHandler);
router.put('/:documentId', updateDocumentHandler);
router.delete('/:documentId', deleteDocumentHandler);

export default router;

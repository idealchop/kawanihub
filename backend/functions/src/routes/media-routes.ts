/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { Router } from 'express';
import {
  createMediaCommentHandler,
  getMediaCommentHandler,
  getMediaHistoryEventHandler,
  listMediaCommentsHandler,
  listMediaHistoryHandler,
  listRecentMediaEventsHandler,
  toggleMediaCommentReactionHandler,
} from '../handlers/media-activity-handler';
import {
  createMediaPieceHandler,
  deleteMediaPieceHandler,
  getMediaPieceHandler,
  listMediaPiecesHandler,
  updateMediaPieceHandler,
} from '../handlers/media-handler';
import { validateFirebaseIdToken } from '../middleware/auth-middleware';
import { requireWorkspace } from '../middleware/workspace-middleware';

const router = Router({ mergeParams: true });

router.use(validateFirebaseIdToken, requireWorkspace);
router.get('/', listMediaPiecesHandler);
router.post('/', createMediaPieceHandler);
router.get('/events', listRecentMediaEventsHandler);
router.get('/:pieceId/comments', listMediaCommentsHandler);
router.get('/:pieceId/comments/:commentId', getMediaCommentHandler);
router.post('/:pieceId/comments', createMediaCommentHandler);
router.post('/:pieceId/comments/:commentId/reactions', toggleMediaCommentReactionHandler);
router.get('/:pieceId/events', listMediaHistoryHandler);
router.get('/:pieceId/events/:eventId', getMediaHistoryEventHandler);
router.get('/:pieceId', getMediaPieceHandler);
router.put('/:pieceId', updateMediaPieceHandler);
router.delete('/:pieceId', deleteMediaPieceHandler);

export default router;

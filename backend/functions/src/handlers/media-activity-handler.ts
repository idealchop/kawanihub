/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import {
  mediaCommentPageQuerySchema,
  mediaCommentWriteSchema,
  mediaHistoryPageQuerySchema,
  mediaRecentPageQuerySchema,
  mediaReactionWriteSchema,
} from '../services/media/media-activity-schema';
import {
  createMediaComment,
  getMediaComment,
  getMediaHistoryEvent,
  listMediaComments,
  listMediaHistory,
  listRecentMediaEvents,
  toggleMediaCommentReaction,
} from '../services/media/media-activity-service';
import { assertModuleAccess } from '../services/members/members-service';
import { HttpError, sendError } from '../utils/errors';

function workspaceIdOf(req: Request): string {
  return req.workspaceId || req.params.workspaceId || '';
}

function actor(req: Request): { uid?: string; email?: string } {
  return { uid: req.user?.uid, email: req.user?.email };
}

async function gate(req: Request): Promise<{ uid: string; workspaceId: string }> {
  const { uid, email } = actor(req);
  if (!uid) throw new HttpError(401, 'Unauthorized');
  const workspaceId = workspaceIdOf(req);
  await assertModuleAccess(workspaceId, uid, 'media', email);
  return { uid, workspaceId };
}

export async function listMediaCommentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, workspaceId } = await gate(req);
    const query = mediaCommentPageQuerySchema.parse(req.query);
    const page = await listMediaComments(workspaceId, req.params.pieceId, uid, query.page, query.pageSize);
    res.json({ comments: page.items, page: page.page, pageSize: page.pageSize, total: page.total });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getMediaCommentHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, workspaceId } = await gate(req);
    const comment = await getMediaComment(workspaceId, req.params.pieceId, req.params.commentId, uid);
    res.json(comment);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createMediaCommentHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, workspaceId } = await gate(req);
    const input = mediaCommentWriteSchema.parse(req.body);
    const comment = await createMediaComment(workspaceId, req.params.pieceId, uid, input.body);
    res.status(201).json(comment);
  } catch (error) {
    sendError(res, error);
  }
}

export async function toggleMediaCommentReactionHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, workspaceId } = await gate(req);
    const input = mediaReactionWriteSchema.parse(req.body);
    const comment = await toggleMediaCommentReaction(
      workspaceId,
      req.params.pieceId,
      req.params.commentId,
      uid,
      input.emoji,
    );
    res.json(comment);
  } catch (error) {
    sendError(res, error);
  }
}

export async function listRecentMediaEventsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, workspaceId } = await gate(req);
    const query = mediaRecentPageQuerySchema.parse(req.query);
    const page = await listRecentMediaEvents(workspaceId, uid, query.page, query.pageSize);
    res.json({ events: page.items, page: page.page, pageSize: page.pageSize, total: page.total });
  } catch (error) {
    sendError(res, error);
  }
}

export async function listMediaHistoryHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, workspaceId } = await gate(req);
    const query = mediaHistoryPageQuerySchema.parse(req.query);
    const page = await listMediaHistory(workspaceId, req.params.pieceId, uid, query.page, query.pageSize);
    res.json({ events: page.items, page: page.page, pageSize: page.pageSize, total: page.total });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getMediaHistoryEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const { uid, workspaceId } = await gate(req);
    const event = await getMediaHistoryEvent(workspaceId, req.params.pieceId, req.params.eventId, uid);
    res.json(event);
  } catch (error) {
    sendError(res, error);
  }
}

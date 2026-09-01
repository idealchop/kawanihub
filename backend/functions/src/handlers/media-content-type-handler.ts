/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { mediaContentTypeWriteSchema } from '../services/media/media-content-type-schema';
import {
  createMediaContentType,
  deleteMediaContentType,
  getMediaContentType,
  listMediaContentTypes,
  updateMediaContentType,
} from '../services/media/media-content-type-service';
import { assertModuleAccess } from '../services/members/members-service';
import { HttpError, sendError } from '../utils/errors';

function actor(req: Request): { uid?: string; email?: string } {
  return { uid: req.user?.uid, email: req.user?.email };
}

async function gate(req: Request): Promise<string> {
  const { uid, email } = actor(req);
  if (!uid) throw new HttpError(401, 'Unauthorized');
  await assertModuleAccess(req.params.workspaceId, uid, 'media', email);
  return uid;
}

export async function listMediaContentTypesHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const types = await listMediaContentTypes(req.params.workspaceId, uid);
    res.json({ types });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getMediaContentTypeHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const type = await getMediaContentType(req.params.workspaceId, req.params.typeId, uid);
    res.json(type);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createMediaContentTypeHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = mediaContentTypeWriteSchema.parse(req.body);
    const type = await createMediaContentType(req.params.workspaceId, uid, input);
    res.status(201).json(type);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateMediaContentTypeHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = mediaContentTypeWriteSchema.parse(req.body);
    const type = await updateMediaContentType(req.params.workspaceId, req.params.typeId, uid, input);
    res.json(type);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteMediaContentTypeHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    await deleteMediaContentType(req.params.workspaceId, req.params.typeId, uid);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

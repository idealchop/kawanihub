/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { mediaPieceWriteSchema } from '../services/media/media-schema';
import { createMediaPiece, deleteMediaPiece, getMediaPiece, listMediaPieces, updateMediaPiece } from '../services/media/media-service';
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

export async function listMediaPiecesHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const pieces = await listMediaPieces(req.params.workspaceId, uid);
    res.json({ pieces });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getMediaPieceHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const piece = await getMediaPiece(req.params.workspaceId, req.params.pieceId, uid);
    res.json(piece);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createMediaPieceHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = mediaPieceWriteSchema.parse(req.body);
    const piece = await createMediaPiece(req.params.workspaceId, uid, input);
    res.status(201).json(piece);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateMediaPieceHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = mediaPieceWriteSchema.parse(req.body);
    const piece = await updateMediaPiece(req.params.workspaceId, req.params.pieceId, uid, input);
    res.json(piece);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteMediaPieceHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    await deleteMediaPiece(req.params.workspaceId, req.params.pieceId, uid);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

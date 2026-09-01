/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { documentWriteSchema } from '../services/documents/documents-schema';
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from '../services/documents/documents-service';
import { assertModuleAccess } from '../services/members/members-service';
import { HttpError, sendError } from '../utils/errors';

function actor(req: Request): { uid?: string; email?: string } {
  return { uid: req.user?.uid, email: req.user?.email };
}

async function gate(req: Request): Promise<string> {
  const { uid, email } = actor(req);
  if (!uid) throw new HttpError(401, 'Unauthorized');
  await assertModuleAccess(req.params.workspaceId, uid, 'documents', email);
  return uid;
}

export async function listDocumentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const documents = await listDocuments(req.params.workspaceId, uid);
    res.json({ documents });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getDocumentHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const document = await getDocument(req.params.workspaceId, req.params.documentId, uid);
    res.json(document);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createDocumentHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = documentWriteSchema.parse(req.body);
    const document = await createDocument(req.params.workspaceId, uid, input);
    res.status(201).json(document);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateDocumentHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = documentWriteSchema.parse(req.body);
    const document = await updateDocument(req.params.workspaceId, req.params.documentId, uid, input);
    res.json(document);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteDocumentHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    await deleteDocument(req.params.workspaceId, req.params.documentId, uid);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

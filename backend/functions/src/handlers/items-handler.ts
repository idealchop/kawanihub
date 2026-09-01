/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { itemWriteSchema } from '../services/items/items-schema';
import { createItem, deleteItem, getItem, listItems, updateItem } from '../services/items/items-service';
import { sendError } from '../utils/errors';

function actor(req: Request): string | undefined {
  return req.user?.uid;
}

export async function listItemsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = actor(req);
    const workspaceId = req.params.workspaceId;
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const items = await listItems(workspaceId, uid);
    res.json({ items });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getItemHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const item = await getItem(req.params.workspaceId, req.params.itemId, uid);
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createItemHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const input = itemWriteSchema.parse(req.body);
    const item = await createItem(req.params.workspaceId, uid, input);
    res.status(201).json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateItemHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const input = itemWriteSchema.parse(req.body);
    const item = await updateItem(req.params.workspaceId, req.params.itemId, uid, input);
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteItemHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = actor(req);
    if (!uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    await deleteItem(req.params.workspaceId, req.params.itemId, uid);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

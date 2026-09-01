/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { notificationPatchSchema, notificationWriteSchema } from '../services/notifications/notifications-schema';
import {
  createNotification,
  deleteNotification,
  getNotification,
  listNotifications,
  updateNotification,
} from '../services/notifications/notifications-service';
import { assertModuleAccess } from '../services/members/members-service';
import { HttpError, sendError } from '../utils/errors';

function actor(req: Request): { uid?: string; email?: string } {
  return { uid: req.user?.uid, email: req.user?.email };
}

async function gate(req: Request): Promise<string> {
  const { uid, email } = actor(req);
  if (!uid) throw new HttpError(401, 'Unauthorized');
  await assertModuleAccess(req.params.workspaceId, uid, 'notifications', email);
  return uid;
}

export async function listNotificationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const notifications = await listNotifications(req.params.workspaceId, uid);
    res.json({ notifications });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getNotificationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const notification = await getNotification(req.params.workspaceId, req.params.notificationId, uid);
    res.json(notification);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createNotificationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = notificationWriteSchema.parse(req.body);
    const notification = await createNotification(req.params.workspaceId, uid, input);
    res.status(201).json(notification);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateNotificationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = 'read' in req.body && Object.keys(req.body).length === 1
      ? notificationPatchSchema.parse(req.body)
      : notificationWriteSchema.parse(req.body);
    const notification = await updateNotification(req.params.workspaceId, req.params.notificationId, uid, input);
    res.json(notification);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteNotificationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    await deleteNotification(req.params.workspaceId, req.params.notificationId, uid);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

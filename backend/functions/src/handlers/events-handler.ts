/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { eventWriteSchema } from '../services/events/events-schema';
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from '../services/events/events-service';
import { assertModuleAccess } from '../services/members/members-service';
import { HttpError, sendError } from '../utils/errors';

function actor(req: Request): { uid?: string; email?: string } {
  return { uid: req.user?.uid, email: req.user?.email };
}

async function gate(req: Request): Promise<string> {
  const { uid, email } = actor(req);
  if (!uid) throw new HttpError(401, 'Unauthorized');
  await assertModuleAccess(req.params.workspaceId, uid, 'calendar', email);
  return uid;
}

export async function listEventsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const events = await listEvents(req.params.workspaceId, uid);
    res.json({ events });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const event = await getEvent(req.params.workspaceId, req.params.eventId, uid);
    res.json(event);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = eventWriteSchema.parse(req.body);
    const event = await createEvent(req.params.workspaceId, uid, input);
    res.status(201).json(event);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = eventWriteSchema.parse(req.body);
    const event = await updateEvent(req.params.workspaceId, req.params.eventId, uid, input);
    res.json(event);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteEventHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    await deleteEvent(req.params.workspaceId, req.params.eventId, uid);
    res.status(204).send();
  } catch (error) {
    sendError(res, error);
  }
}

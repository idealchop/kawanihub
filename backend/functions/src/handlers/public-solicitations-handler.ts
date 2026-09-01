/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import {
  publicRequirementsSchema,
  publicSolicitationWriteSchema,
  solicitationClaimSchema,
  solicitationTrackSchema,
} from '../services/solicitations/solicitation-schema';
import {
  claimPublicSolicitation,
  createPublicSolicitation,
  getPublicSolicitation,
  getRequirementCatalog,
  submitPublicRequirements,
  trackPublicSolicitation,
} from '../services/solicitations/solicitation-service';
import { sendError } from '../utils/errors';

export async function publicCatalogHandler(_req: Request, res: Response): Promise<void> {
  res.json({ catalog: getRequirementCatalog() });
}

export async function publicCreateSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const input = publicSolicitationWriteSchema.parse(req.body);
    const solicitation = await createPublicSolicitation(req.params.workspaceId, input);
    res.status(201).json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function publicGetSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const solicitation = await getPublicSolicitation(req.params.workspaceId, req.params.solicitationId);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function publicSubmitRequirementsHandler(req: Request, res: Response): Promise<void> {
  try {
    const input = publicRequirementsSchema.parse(req.body);
    const solicitation = await submitPublicRequirements(req.params.workspaceId, req.params.solicitationId, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function publicTrackSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const input = solicitationTrackSchema.parse(req.body);
    const solicitation = await trackPublicSolicitation(req.params.workspaceId, input.controlNumber);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function publicClaimSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const input = solicitationClaimSchema.parse(req.body);
    const solicitation = await claimPublicSolicitation(req.params.workspaceId, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

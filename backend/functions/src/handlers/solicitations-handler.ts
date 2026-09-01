/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { Request, Response } from 'express';
import { assertModuleAccess } from '../services/members/members-service';
import {
  solicitationApproveSchema,
  solicitationAssignSchema,
  solicitationClaimSchema,
  solicitationEscalateSchema,
  solicitationFlagSchema,
  solicitationMissingSchema,
  solicitationRejectSchema,
  solicitationWriteSchema,
} from '../services/solicitations/solicitation-schema';
import {
  approveSolicitation,
  assignSolicitation,
  exportSolicitationReport,
  claimSolicitation,
  createSolicitation,
  escalateSolicitation,
  expediteSolicitation,
  flagSolicitation,
  getSolicitation,
  markReadyToClaim,
  listPersonHistory,
  listDueDiligence,
  listVisibleSolicitations,
  rejectSolicitation,
  requestMissingRequirements,
  submitForReview,
  updateSolicitation,
} from '../services/solicitations/solicitation-service';
import { parseSolicitationReportFormat } from '../services/solicitations/solicitation-report';
import { HttpError, sendError } from '../utils/errors';

async function gate(req: Request): Promise<string> {
  const uid = req.user?.uid;
  if (!uid) throw new HttpError(401, 'Unauthorized');
  await assertModuleAccess(req.params.workspaceId, uid, 'solicitation', req.user?.email);
  return uid;
}

export async function listSolicitationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const payload = await listVisibleSolicitations(req.params.workspaceId, uid);
    res.json(payload);
  } catch (error) {
    sendError(res, error);
  }
}

export async function reportSolicitationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const format = parseSolicitationReportFormat(req.query.format);
    const file = await exportSolicitationReport(req.params.workspaceId, uid, format);
    res.json({
      filename: file.filename,
      mime: file.mime,
      body: file.bytes.toString('base64'),
      ...(file.csv !== undefined ? { csv: file.csv } : {}),
    });
  } catch (error) {
    sendError(res, error);
  }
}

export async function historySolicitationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const solicitations = await listPersonHistory(req.params.workspaceId, uid, {
      name: typeof req.query.name === 'string' ? req.query.name : '',
      idNumber: typeof req.query.idNumber === 'string' ? req.query.idNumber : '',
      barangay: typeof req.query.barangay === 'string' ? req.query.barangay : '',
    });
    res.json({ solicitations });
  } catch (error) {
    sendError(res, error);
  }
}

export async function dueDiligenceSolicitationsHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const payload = await listDueDiligence(req.params.workspaceId, req.params.solicitationId, uid);
    res.json(payload);
  } catch (error) {
    sendError(res, error);
  }
}

export async function getSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const solicitation = await getSolicitation(req.params.workspaceId, req.params.solicitationId, uid);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function createSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationWriteSchema.parse(req.body);
    const solicitation = await createSolicitation(req.params.workspaceId, uid, input);
    res.status(201).json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationWriteSchema.parse(req.body);
    const solicitation = await updateSolicitation(req.params.workspaceId, req.params.solicitationId, uid, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function reviewSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const solicitation = await submitForReview(req.params.workspaceId, req.params.solicitationId, uid);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function approveSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationApproveSchema.parse(req.body ?? {});
    const solicitation = await approveSolicitation(req.params.workspaceId, req.params.solicitationId, uid, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function markReadyToClaimHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const solicitation = await markReadyToClaim(req.params.workspaceId, req.params.solicitationId, uid);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function rejectSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationRejectSchema.parse(req.body);
    const solicitation = await rejectSolicitation(req.params.workspaceId, req.params.solicitationId, uid, input.reason);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function assignSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationAssignSchema.parse(req.body);
    const solicitation = await assignSolicitation(req.params.workspaceId, req.params.solicitationId, uid, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function missingSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationMissingSchema.parse(req.body);
    const solicitation = await requestMissingRequirements(req.params.workspaceId, req.params.solicitationId, uid, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function escalateSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationEscalateSchema.parse(req.body);
    const solicitation = await escalateSolicitation(req.params.workspaceId, req.params.solicitationId, uid, input.note);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function expediteSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const solicitation = await expediteSolicitation(req.params.workspaceId, req.params.solicitationId, uid);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function flagSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationFlagSchema.parse(req.body);
    const solicitation = await flagSolicitation(req.params.workspaceId, req.params.solicitationId, uid, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

export async function claimSolicitationHandler(req: Request, res: Response): Promise<void> {
  try {
    const uid = await gate(req);
    const input = solicitationClaimSchema.parse(req.body);
    const solicitation = await claimSolicitation(req.params.workspaceId, uid, input);
    res.json(solicitation);
  } catch (error) {
    sendError(res, error);
  }
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { NextFunction, Request, Response } from 'express';
import { demoMode, getAdminAuth } from '../config/firebase-admin';

export async function validateFirebaseIdToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = header.slice('Bearer '.length);

  if (demoMode && token === 'DEMO_TOKEN') {
    req.user = {
      uid: 'demo-owner',
      email: typeof req.headers['x-demo-email'] === 'string' ? req.headers['x-demo-email'] : 'admin@kawanihub.ph',
      name: 'Admin',
    };
    next();
    return;
  }

  if (process.env.FUNCTIONS_EMULATOR && token === 'MOCK_TOKEN') {
    req.user = { uid: 'user123', email: 'test@test.com', name: 'BDD Tester' };
    next();
    return;
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email, name: decoded.name };
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

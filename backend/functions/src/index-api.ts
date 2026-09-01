/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { brand } from './config/brand';
import activityRoutes from './routes/activity-routes';
import analyticsRoutes from './routes/analytics-routes';
import documentsRoutes from './routes/documents-routes';
import eventsRoutes from './routes/events-routes';
import mediaContentTypeRoutes from './routes/media-content-type-routes';
import mediaRoutes from './routes/media-routes';
import membersRoutes from './routes/members-routes';
import publicSolicitationsRoutes from './routes/public-solicitations-routes';
import solicitationsRoutes from './routes/solicitations-routes';
import notificationsRoutes from './routes/notifications-routes';
import workspacesRoutes from './routes/workspaces-routes';

export const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: true }));
app.use(express.json({ limit: '4mb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.method === 'OPTIONS' || !!process.env.FUNCTIONS_EMULATOR || process.env.DEMO_MODE !== 'false',
  }),
);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    product: brand.productSlug,
    copyright: `Copyright (c) ${brand.copyrightYear} ${brand.legalName}. All rights reserved.`,
    emulator: !!process.env.FUNCTIONS_EMULATOR,
  });
});

app.use('/workspaces', workspacesRoutes);
app.use('/workspaces/:workspaceId/analytics', analyticsRoutes);
app.use('/workspaces/:workspaceId/members', membersRoutes);
app.use('/workspaces/:workspaceId/notifications', notificationsRoutes);
app.use('/workspaces/:workspaceId/media-types', mediaContentTypeRoutes);
app.use('/workspaces/:workspaceId/media', mediaRoutes);
app.use('/workspaces/:workspaceId/events', eventsRoutes);
app.use('/workspaces/:workspaceId/documents', documentsRoutes);
app.use('/workspaces/:workspaceId/activity', activityRoutes);
app.use('/public/workspaces/:workspaceId/solicitations', publicSolicitationsRoutes);
app.use('/workspaces/:workspaceId/solicitations', solicitationsRoutes);

export const api = express();
api.use('/', app);

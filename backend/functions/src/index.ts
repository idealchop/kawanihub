/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { onRequest } from 'firebase-functions/v2/https';
import { api, app } from './index-api';

export { app };

export const kawanihubApi = onRequest(
  {
    region: 'asia-southeast1',
    cors: true,
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  api,
);

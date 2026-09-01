/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type AuthUser = {
  uid: string;
  email?: string;
  name?: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      workspaceId?: string;
    }
  }
}

export {};

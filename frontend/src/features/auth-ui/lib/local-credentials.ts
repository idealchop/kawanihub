/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 *
 * Temporary local login. No Firebase.
 */
import { DEMO_OWNER_LOGIN, findDemoLogin } from './demo-desk-users';

export const localCredentials = DEMO_OWNER_LOGIN;

export function isLocalAdmin(username: string, password: string): boolean {
  return Boolean(findDemoLogin(username, password));
}

export { findDemoLogin };

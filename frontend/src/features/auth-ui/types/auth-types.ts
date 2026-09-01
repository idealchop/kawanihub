/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export type AuthMode = 'sign-in' | 'sign-up';

export type AuthSession = {
  uid: string;
  email: string;
  username?: string;
};

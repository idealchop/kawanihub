/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import type { AppModule } from './nav-items';

export function moduleForDeskPath(pathname: string): AppModule | null {
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/overview')) return 'dashboard';
  if (
    pathname.startsWith('/queue') ||
    pathname.startsWith('/items') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/calendar')
  ) {
    return 'solicitation';
  }
  if (pathname.startsWith('/media')) return 'media';
  if (pathname.startsWith('/legislative')) return 'legislative';
  if (pathname.startsWith('/assistant')) return 'assistant';
  if (pathname.startsWith('/users')) return 'users';
  if (pathname.startsWith('/notifications')) return 'notifications';
  if (pathname.startsWith('/activity')) return 'activity';
  return null;
}

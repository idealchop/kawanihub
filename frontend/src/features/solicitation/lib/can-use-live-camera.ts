/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

/** In-page getUserMedia only works on HTTPS or localhost. Phone LAN HTTP is not a secure context. */
export function canUseLiveCamera(win: Pick<Window, 'isSecureContext' | 'navigator'> = window): boolean {
  return win.isSecureContext && Boolean(win.navigator.mediaDevices?.getUserMedia);
}

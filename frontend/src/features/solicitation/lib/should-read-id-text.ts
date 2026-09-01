/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

/** Front of the ID is always read after the photo is saved. Failures must not drop the photo. */
export function shouldReadIdText(): boolean {
  return true;
}

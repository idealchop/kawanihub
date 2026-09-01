/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { canUseLiveCamera } from '@/features/solicitation/lib/can-use-live-camera';

describe('canUseLiveCamera', () => {
  it('allows the in-page camera on a secure origin', () => {
    expect(
      canUseLiveCamera({
        isSecureContext: true,
        navigator: { mediaDevices: { getUserMedia: async () => new MediaStream() } } as unknown as Navigator,
      }),
    ).toBe(true);
  });

  it('blocks the in-page camera on phone LAN HTTP', () => {
    expect(
      canUseLiveCamera({
        isSecureContext: false,
        navigator: { mediaDevices: { getUserMedia: async () => new MediaStream() } } as unknown as Navigator,
      }),
    ).toBe(false);
  });
});

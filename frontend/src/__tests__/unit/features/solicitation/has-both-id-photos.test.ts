/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { hasBothIdPhotos } from '@/features/solicitation/types/solicitation';

const photo = 'data:image/jpeg;base64,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('hasBothIdPhotos', () => {
  it('requires front and back', () => {
    expect(hasBothIdPhotos({ idPhoto: photo, idPhotoBack: photo })).toBe(true);
    expect(hasBothIdPhotos({ idPhoto: photo, idPhotoBack: '' })).toBe(false);
    expect(hasBothIdPhotos({ idPhoto: '', idPhotoBack: photo })).toBe(false);
  });
});

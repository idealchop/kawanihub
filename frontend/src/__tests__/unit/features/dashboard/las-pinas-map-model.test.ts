/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { BARANGAY_OPTIONS } from '@/features/solicitation/lib/barangay-list';
import { buildLasPinasMap, isOpenDeskStatus, loadFill, loadLabelTone } from '@/features/dashboard/lib/las-pinas-map-model';

describe('las-pinas-map-model', () => {
  it('projects all official Las Piñas barangays', () => {
    const { shapes, width, height } = buildLasPinasMap();
    expect(shapes.map((shape) => shape.name).sort()).toEqual([...BARANGAY_OPTIONS].sort());
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
    expect(shapes.every((shape) => shape.path.startsWith('M'))).toBe(true);
    expect(shapes.every((shape) => shape.area >= 0)).toBe(true);
    expect(Math.max(...shapes.map((shape) => shape.area))).toBeGreaterThan(4200);
  });

  it('paints heavier load darker', () => {
    expect(loadFill(0, 10)).toBe('#eef3f7');
    expect(loadFill(10, 10)).toBe('rgb(15 76 129)');
    expect(loadLabelTone(0, 10)).toBe('dark');
    expect(loadLabelTone(10, 10)).toBe('light');
  });

  it('treats claimed as closed desk work', () => {
    expect(isOpenDeskStatus('under_review')).toBe(true);
    expect(isOpenDeskStatus('claimed')).toBe(false);
    expect(isOpenDeskStatus('rejected')).toBe(false);
  });
});

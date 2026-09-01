/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { BARANGAY_OPTIONS } from '@/features/solicitation/lib/barangay-list';

export const LAS_PINAS_DISTRICT_1 = [
  'Daniel Fajardo',
  'Elias Aldana',
  'Ilaya',
  'Manuyo Uno',
  'Manuyo Dos',
  'Pamplona Uno',
  'Pamplona Tres',
  'Pulang Lupa Uno',
  'Pulang Lupa Dos',
  'Zapote',
] as const;

export const LAS_PINAS_DISTRICT_2 = [
  'Almanza Uno',
  'Almanza Dos',
  'BF International Village',
  'Pamplona Dos',
  'Pilar',
  'Talon Uno',
  'Talon Dos',
  'Talon Tres',
  'Talon Kuatro',
  'Talon Singko',
] as const;

export type LasPinasBarangay = (typeof BARANGAY_OPTIONS)[number];

export function queueHref(input: { status?: string; barangay?: string }): string {
  const params = new URLSearchParams();
  if (input.status) params.set('status', input.status);
  if (input.barangay) params.set('barangay', input.barangay);
  const query = params.toString();
  return query ? `/queue?${query}` : '/queue';
}

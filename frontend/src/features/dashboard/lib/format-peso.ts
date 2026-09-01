/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
export function formatPeso(amount: number): string {
  const value = Number.isFinite(amount) ? Math.round(amount) : 0;
  const digits = Math.abs(value).toLocaleString('en-PH', { maximumFractionDigits: 0 });
  return value < 0 ? `-₱${digits}` : `₱${digits}`;
}

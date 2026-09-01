/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { randomInt } from 'crypto';
import { COOLDOWN_DAYS, type FirstFamilyRelative, type PolicyFlag, type SolicitationKind, type SolicitationRecord } from './solicitation-types';

/** No 0/O/1/I/L so staff can read the code aloud. */
const CLAIM_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CLAIM_BODY_LENGTH = 8;

export const REQUIREMENT_CATALOG: Record<SolicitationKind, { id: string; label: string }[]> = {
  medical: [
    { id: 'valid-id', label: 'Valid government ID' },
    { id: 'medical-certificate', label: 'Medical certificate' },
    { id: 'hospital-bill', label: 'Hospital bill or prescription' },
  ],
  burial: [
    { id: 'valid-id', label: 'Valid government ID' },
    { id: 'death-certificate', label: 'Death certificate' },
    { id: 'funeral-contract', label: 'Funeral contract or statement of account' },
  ],
  education: [
    { id: 'valid-id', label: 'Valid government ID' },
    { id: 'enrollment', label: 'Enrollment or registration form' },
    { id: 'assessment', label: 'School assessment or billing' },
  ],
  events: [
    { id: 'valid-id', label: 'Valid government ID' },
    { id: 'event-letter', label: 'Invitation or event letter' },
  ],
  financial: [
    { id: 'valid-id', label: 'Valid government ID' },
    { id: 'need-proof', label: 'Proof of need or bill' },
  ],
  daily: [
    { id: 'valid-id', label: 'Valid government ID' },
    { id: 'request-note', label: 'Short note of the daily need' },
  ],
};

export function issueRequirements(kind: SolicitationKind) {
  return REQUIREMENT_CATALOG[kind].map((item) => ({
    ...item,
    submitted: false,
    validated: false,
    photo: '',
    photoName: '',
    note: '',
  }));
}

export function normalizePerson(name: string, barangay = '', idNumber = ''): string {
  const id = idNumber.trim().toLowerCase();
  if (id) return `id:${id}`;
  return `${name.trim().toLowerCase().replace(/\s+/g, ' ')}|${barangay.trim().toLowerCase()}`;
}

export function namesMatch(left: string, right: string): boolean {
  return left.trim().toLowerCase().replace(/\s+/g, ' ') === right.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function requirementsComplete(row: Pick<SolicitationRecord, 'requirements'>): boolean {
  return row.requirements.length > 0 && row.requirements.every((item) => item.submitted && item.validated);
}

export function evaluatePolicy(
  candidate: Pick<SolicitationRecord, 'id' | 'requesterName' | 'barangay' | 'idNumber' | 'relatives' | 'createdAt'>,
  existing: SolicitationRecord[],
  now = new Date(),
): { flags: PolicyFlag[]; cooldownBlocked: boolean } {
  const flags: PolicyFlag[] = [];
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - COOLDOWN_DAYS);
  const person = normalizePerson(candidate.requesterName, candidate.barangay, candidate.idNumber);

  const recentOwn = existing.filter((row) => {
    if (row.id === candidate.id || row.status === 'rejected') return false;
    if (normalizePerson(row.requesterName, row.barangay, row.idNumber) !== person) return false;
    return new Date(row.createdAt).getTime() >= cutoff.getTime();
  });

  for (const row of recentOwn) {
    flags.push({
      type: 'cooldown',
      message: `${candidate.requesterName} already has a solicitation within ${COOLDOWN_DAYS} days.`,
      relatedSolicitationId: row.id,
    });
  }

  const relativeNames = candidate.relatives.map((relative) => relative.name).filter((name) => name.trim());
  for (const relativeName of relativeNames) {
    const hit = existing.find((row) => {
      if (row.id === candidate.id || row.status === 'rejected') return false;
      if (new Date(row.createdAt).getTime() < cutoff.getTime() && row.status === 'claimed') return false;
      return namesMatch(row.requesterName, relativeName);
    });
    if (hit) {
      flags.push({
        type: 'relative',
        message: `First-family match: ${relativeName} already has a solicitation.`,
        relatedSolicitationId: hit.id,
      });
    }
  }

  const listedAsRelative = existing.find((row) => {
    if (row.id === candidate.id || row.status === 'rejected') return false;
    return row.relatives.some((relative) => namesMatch(relative.name, candidate.requesterName));
  });
  if (listedAsRelative) {
    flags.push({
      type: 'relative',
      message: `${candidate.requesterName} is listed as first family on another solicitation.`,
      relatedSolicitationId: listedAsRelative.id,
    });
  }

  return { flags, cooldownBlocked: flags.some((flag) => flag.type === 'cooldown') };
}

export function normalizeClaimCode(value: string): string {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (compact.startsWith('KH') && compact.length >= 10) {
    return `KH-${compact.slice(2, 6)}-${compact.slice(6, 10)}`;
  }
  if (compact.length === CLAIM_BODY_LENGTH) {
    return `KH-${compact.slice(0, 4)}-${compact.slice(4)}`;
  }
  return compact;
}

export function issueClaimCode(existing: Pick<SolicitationRecord, 'controlNumber'>[]): string {
  const taken = new Set(existing.map((row) => normalizeClaimCode(row.controlNumber)).filter(Boolean));
  for (let attempt = 0; attempt < 32; attempt += 1) {
    let body = '';
    for (let i = 0; i < CLAIM_BODY_LENGTH; i += 1) {
      body += CLAIM_ALPHABET[randomInt(CLAIM_ALPHABET.length)];
    }
    const code = `KH-${body.slice(0, 4)}-${body.slice(4)}`;
    if (!taken.has(code)) return code;
  }
  throw new Error('Could not issue a unique claim code');
}

export type { FirstFamilyRelative };

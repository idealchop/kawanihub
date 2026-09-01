/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { namesMatch } from './solicitation-policy';
import type { RelativeRelation, SolicitationKind, SolicitationRecord, SolicitationStatus } from './solicitation-types';

const NAME_SUFFIXES = new Set(['jr', 'sr', 'i', 'ii', 'iii', 'iv', 'v']);
const MIN_CONFIDENCE = 40;

export type DueDiligenceRecord = {
  id: string;
  controlNumber: string;
  status: SolicitationStatus;
  kind: SolicitationKind;
  requestedAt: string;
  receivedAt: string;
  asRequestor: boolean;
  asBeneficiary: boolean;
};

export type DueDiligenceMatch = {
  name: string;
  confidence: number;
  asRequestor: boolean;
  asBeneficiary: boolean;
  taggedRelative: boolean;
  relation: RelativeRelation | '';
  records: DueDiligenceRecord[];
};

export function personNameKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function nameTokens(name: string): string[] {
  return personNameKey(name)
    .replace(/[.,]/g, '')
    .split(' ')
    .filter((token) => token && !NAME_SUFFIXES.has(token));
}

export function familyName(name: string): string {
  const tokens = nameTokens(name);
  return tokens[tokens.length - 1] ?? '';
}

export function matchConfidence(
  matchName: string,
  current: Pick<SolicitationRecord, 'requesterName' | 'beneficiaryName' | 'barangay' | 'idNumber' | 'relatives'>,
  sample: Pick<SolicitationRecord, 'barangay' | 'idNumber'>,
): number {
  let score = 0;
  if (
    current.idNumber.trim() &&
    sample.idNumber.trim() &&
    current.idNumber.trim().toLowerCase() === sample.idNumber.trim().toLowerCase()
  ) {
    score += 50;
  }
  if (namesMatch(matchName, current.requesterName) || namesMatch(matchName, current.beneficiaryName)) {
    score += 40;
  } else {
    const family = familyName(matchName);
    if (family && (family === familyName(current.requesterName) || family === familyName(current.beneficiaryName))) {
      score += 25;
    }
  }
  if (current.relatives.some((relative) => namesMatch(relative.name, matchName))) {
    score += 20;
  }
  if (
    current.barangay.trim() &&
    sample.barangay.trim() &&
    current.barangay.trim().toLowerCase() === sample.barangay.trim().toLowerCase()
  ) {
    score += 15;
  }
  const first = nameTokens(matchName)[0];
  if (
    first &&
    (nameTokens(current.requesterName)[0] === first || nameTokens(current.beneficiaryName)[0] === first)
  ) {
    score += 10;
  }
  return Math.min(100, score);
}

export function buildDueDiligenceMatches(current: SolicitationRecord, rows: SolicitationRecord[]): DueDiligenceMatch[] {
  const others = rows.filter((row) => row.id !== current.id);
  const names = new Set<string>();
  for (const row of others) {
    if (row.requesterName.trim()) names.add(personNameKey(row.requesterName));
    if (row.beneficiaryName.trim()) names.add(personNameKey(row.beneficiaryName));
  }
  for (const relative of current.relatives) {
    if (relative.name.trim()) names.add(personNameKey(relative.name));
  }

  const matches: DueDiligenceMatch[] = [];
  for (const key of names) {
    const records: DueDiligenceRecord[] = [];
    let displayName = '';
    let asRequestor = false;
    let asBeneficiary = false;
    let sample: Pick<SolicitationRecord, 'barangay' | 'idNumber'> = { barangay: '', idNumber: '' };
    let bestScore = -1;

    for (const row of others) {
      const req = personNameKey(row.requesterName) === key;
      const ben = Boolean(row.beneficiaryName.trim()) && personNameKey(row.beneficiaryName) === key;
      if (!req && !ben) continue;
      displayName = req ? row.requesterName.trim() : row.beneficiaryName.trim();
      asRequestor = asRequestor || req;
      asBeneficiary = asBeneficiary || ben;
      const score = matchConfidence(displayName, current, row);
      if (score >= bestScore) {
        bestScore = score;
        sample = row;
      }
      records.push({
        id: row.id,
        controlNumber: row.controlNumber,
        status: row.status,
        kind: row.kind,
        requestedAt: row.createdAt,
        receivedAt: row.claimedAt,
        asRequestor: req,
        asBeneficiary: ben,
      });
    }

    const tagged = current.relatives.find((relative) => personNameKey(relative.name) === key);
    if (!displayName && tagged) displayName = tagged.name;
    if (!displayName) continue;
    const confidence = matchConfidence(displayName, current, sample);
    if (confidence < MIN_CONFIDENCE && !tagged) continue;

    records.sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));
    matches.push({
      name: displayName,
      confidence,
      asRequestor,
      asBeneficiary,
      taggedRelative: Boolean(tagged),
      relation: tagged?.relation ?? '',
      records,
    });
  }

  return matches.sort((left, right) => right.confidence - left.confidence || left.name.localeCompare(right.name));
}

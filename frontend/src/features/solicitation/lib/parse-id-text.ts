/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { BARANGAY_OPTIONS } from './barangay-list';
import type { AddressIdType } from '../types/solicitation';

const NOISE = [
  'republic',
  'philippines',
  'philippine',
  'identification',
  'pambansang',
  'pagkakakilanlan',
  'card',
  'sex',
  'date',
  'birth',
  'nationality',
  'blood',
  'marital',
  'signature',
  'given',
  'names',
  'last',
  'name',
  'middle',
  'first',
  'surname',
  'apelyido',
  'pangalan',
  'address',
  'tirahan',
  'license',
  'driver',
  'land',
  'transportation',
  'office',
  'umid',
  'gsis',
  'sss',
  'philhealth',
  'comelec',
  'postal',
];

const GENERIC_BARANGAY = new Set(['Poblacion', 'Malaya']);
const OTHER_CITY = /muntinlupa|makati|pasay|para[nñ]aque|manila|taguig|cavite|caloocan|quezon/;

export type ParsedIdFields = {
  idType?: AddressIdType;
  idNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  building?: string;
  street?: string;
  subdivision?: string;
  barangay?: string;
};

export function detectIdType(text: string): AddressIdType | undefined {
  const value = text.toLowerCase();
  if (value.includes('philsys') || value.includes('philippine identification') || value.includes('pambansang pagkakakilanlan') || value.includes('psn')) {
    return 'philsys';
  }
  if (value.includes('driver') || value.includes('lto') || value.includes('land transportation')) {
    return 'drivers_license';
  }
  if (value.includes('umid') || value.includes('crn') || value.includes('unified multi')) {
    return 'umid';
  }
  if (value.includes('comelec') || value.includes('voter')) return 'voters';
  if (value.includes('postal')) return 'postal';
  if (value.includes('barangay')) return 'barangay_id';
  return undefined;
}

function normalizeDigits(value: string): string {
  return value.replace(/[Oo]/g, '0').replace(/[IlL|]/g, '1');
}

function formatCrn(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12) return `${digits.slice(0, 4)}-${digits.slice(4, 11)}-${digits.slice(11)}`;
  return value.replace(/\s+/g, '-');
}

export function extractIdNumber(text: string): string | undefined {
  const compact = normalizeDigits(text);
  const philsys = compact.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/);
  if (philsys) return philsys[0].replace(/\s+/g, '-');
  const labeledCrn = compact.match(/CRN[-\s]*(\d{4}[-\s]\d{6,8}[-\s]\d)/i);
  if (labeledCrn) return formatCrn(labeledCrn[1]);
  const crn = compact.match(/\b\d{4}[-\s]\d{7}[-\s]\d\b/);
  if (crn) return formatCrn(crn[0]);
  const license = compact.match(/\b[A-Z]\d{2}[-\s]?\d{2}[-\s]?\d{6}\b/i);
  if (license) return license[0].toUpperCase();
  const digits = compact.match(/\b\d{8,16}\b/);
  return digits?.[0];
}

function cleanName(value: string): string {
  return value
    .replace(/[^A-Za-zÑñ.\-'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:[A-Za-z]\s+)+/, '');
}

function isNameValue(value: string): boolean {
  if (value.length < 2) return false;
  if (NOISE.includes(value.toLowerCase())) return false;
  if (/^(a|an|the)$/i.test(value)) return false;
  if (value.split(/\s+/).every((part) => part.length <= 1)) return false;
  return true;
}

function lineAfter(label: RegExp, lines: string[]): string | undefined {
  const index = lines.findIndex((line) => label.test(line));
  if (index < 0) return undefined;
  const same = cleanName(lines[index].replace(label, ''));
  const next = cleanName(lines[index + 1] ?? '');
  if (isNameValue(same) && !(same.length < 4 && isNameValue(next))) return same;
  return isNameValue(next) ? next : undefined;
}

export function matchBarangay(text: string): string | undefined {
  const haystack = text.toLowerCase();
  const lasPinas = /las\s*pi[nñ]as/.test(haystack);
  if (OTHER_CITY.test(haystack) && !lasPinas) return undefined;
  return BARANGAY_OPTIONS.find((name) => {
    if (!haystack.includes(name.toLowerCase())) return false;
    if (GENERIC_BARANGAY.has(name) && !lasPinas) return false;
    return true;
  });
}

function extractAddressParts(text: string, lines: string[]): Pick<ParsedIdFields, 'building' | 'street' | 'subdivision'> {
  const buildingMatch = text.match(/\b(?:blk|bk|bldg|block)\s*\d+(?:\s+lot\s*\d+)?|\blot\s*\d+/i);
  const building = buildingMatch?.[0]?.replace(/\bbk\b/i, 'BLK').replace(/\s+/g, ' ').trim();

  const lotLine = lines.find((line) => /\b(blk|bk|bldg|block|lot)\b/i.test(line));
  const fromLot = lotLine
    ?.replace(/\b(?:blk|bk|bldg|block)\s*\d+/gi, '')
    .replace(/\blot\s*\d+/gi, '')
    .replace(/[,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const roadLine = lines.find((line) => /\b(st\.?|street|ave\.?|road)(?=\s|,|$)/i.test(line));
  const subdivision = roadLine && /vill(?:age)?|subd/i.test(roadLine)
    ? cleanName(roadLine.replace(/^\s*st\.?\s*/i, ''))
    : undefined;
  const road = roadLine
    ?.replace(/\s+(vill(?:age)?|subd(?:ivision)?).*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const streetParts = lotLine && roadLine && lotLine === roadLine ? [fromLot] : [fromLot, road];
  const street = streetParts
    .filter((part): part is string => Boolean(part && part.length > 1 && !/^(st\.?|street)$/i.test(part)))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    building: building || undefined,
    street: street || undefined,
    subdivision: subdivision || undefined,
  };
}

export function parseIdText(raw: string): ParsedIdFields {
  const text = raw.replace(/\r/g, '\n');
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const lastName = lineAfter(/last\s*name|surname|apelyido/i, lines);
  const firstName = lineAfter(/given\s*names?|first\s*name|pangalan/i, lines);
  const middleName = lineAfter(/middle\s*name/i, lines);
  const address = extractAddressParts(text, lines);
  const labeledStreet = lineAfter(/address|tirahan/i, lines);
  const barangay = matchBarangay(text);
  const street = (address.street || labeledStreet || '')
    .replace(barangay ? new RegExp(`,?\\s*${barangay}\\b.*$`, 'i') : /$/, '')
    .replace(/las\s*pi[nñ]as.*$/i, '')
    .replace(/,\s*$/, '')
    .trim();

  return {
    idType: detectIdType(text),
    idNumber: extractIdNumber(text),
    firstName,
    middleName,
    lastName,
    building: address.building,
    street: street || undefined,
    subdivision: address.subdivision,
    barangay,
  };
}

export function parsedIdHasFields(parsed: ParsedIdFields): boolean {
  return Boolean(parsed.idNumber || parsed.firstName || parsed.lastName || parsed.barangay || parsed.street || parsed.building);
}

const FIELD_KEYS = ['idNumber', 'firstName', 'middleName', 'lastName', 'building', 'street', 'subdivision', 'barangay'] as const;

export function scoreParsedId(parsed: ParsedIdFields): number {
  return FIELD_KEYS.reduce((score, key) => score + (parsed[key] ? 1 : 0), 0);
}

function isOneLetterLonger(longer: string, shorter: string): boolean {
  if (longer.length - shorter.length !== 1 || shorter.length < 4) return false;
  let skip = 0;
  let index = 0;
  for (const letter of longer) {
    if (letter === shorter[index]) {
      index += 1;
      continue;
    }
    skip += 1;
    if (skip > 1) return false;
  }
  return index === shorter.length;
}

function preferName(primary?: string, extra?: string): string | undefined {
  if (!primary) return extra;
  if (!extra) return primary;
  if (isOneLetterLonger(primary, extra)) return extra;
  if (isOneLetterLonger(extra, primary)) return primary;
  return primary;
}

function preferIdNumber(primary?: string, extra?: string): string | undefined {
  if (!primary) return extra;
  if (!extra) return primary;
  const primaryDigits = primary.replace(/\D/g, '');
  const extraDigits = extra.replace(/\D/g, '');
  if (primaryDigits.length === 12) return primary;
  if (extraDigits.length === 12) return extra;
  return primary;
}

export function mergeParsedId(left: ParsedIdFields, right: ParsedIdFields): ParsedIdFields {
  const [primary, extra] = scoreParsedId(left) >= scoreParsedId(right) ? [left, right] : [right, left];
  return {
    idType: primary.idType ?? extra.idType,
    idNumber: preferIdNumber(primary.idNumber, extra.idNumber),
    firstName: preferName(primary.firstName, extra.firstName),
    middleName: preferName(primary.middleName, extra.middleName),
    lastName: preferName(primary.lastName, extra.lastName),
    building: primary.building ?? extra.building,
    street: primary.street ?? extra.street,
    subdivision: primary.subdivision ?? extra.subdivision,
    barangay: primary.barangay ?? extra.barangay,
  };
}

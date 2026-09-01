/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { describe, expect, it } from 'vitest';
import { detectIdType, extractIdNumber, mergeParsedId, parseIdText } from '@/features/solicitation/lib/parse-id-text';

const philsys = `
REPUBLIC OF THE PHILIPPINES
Philippine Identification Card
Last Name
MENDOZA
Given Names
ROSA DELA
Middle Name
CRUZ
Address
BLK 1 LOT 2 MAIN ST, ZAPOTE, LAS PINAS CITY
PSN 1234-5678-9012-3456
`;

const umid = `
REPUBLIC OF THE PHILIPPINES
Unified Multi-Purpose ID
CRN-0111-8634005-2
SURNAME
HIMBING
GIVEN NAME
JUSTFER
MIDDLE NAME
DETALLA
SEX M
DATE OF BIRTH 1997/06/30
BLK 08 LOT 09 E. CAGUIAO
ST. KATARUNGAN VILL
POBLACION MUNTINLUPA CITY
NCR PHL 1776
`;

const umidOcr = `
BERRI Ce wie CRY
GRE =
§ NR REPUBLIC OF THE PHILIPPINES of =
& & : Unified Multi-Purpose 1D
3 CRN-0L1L-3L34005-2 :
SURNAME
HIMNBING
a A GIVEN NAME
a JUSTFER
ust MIDDLE NAME
— DETALLA
hy & sex part oraers 1997/06/38
a BK 08 LOT 09 E. CAGHIA
ST. KATARUNGAN VILL
POBLACION MUNTINLUPA
= NCR PHL 17?bk
`;

describe('parseIdText', () => {
  it('reads a PhilSys card', () => {
    expect(detectIdType(philsys)).toBe('philsys');
    expect(extractIdNumber(philsys)).toBe('1234-5678-9012-3456');
    const parsed = parseIdText(philsys);
    expect(parsed.lastName).toBe('MENDOZA');
    expect(parsed.firstName).toBe('ROSA DELA');
    expect(parsed.middleName).toBe('CRUZ');
    expect(parsed.building).toBe('BLK 1 LOT 2');
    expect(parsed.street).toMatch(/MAIN ST/i);
    expect(parsed.barangay).toBe('Zapote');
  });

  it('reads a UMID card including the CRN and address lines', () => {
    expect(detectIdType(umid)).toBe('umid');
    expect(extractIdNumber(umid)).toBe('0111-8634005-2');
    const parsed = parseIdText(umid);
    expect(parsed.lastName).toBe('HIMBING');
    expect(parsed.firstName).toBe('JUSTFER');
    expect(parsed.middleName).toBe('DETALLA');
    expect(parsed.building).toMatch(/BLK 08 LOT 09/i);
    expect(parsed.street).toMatch(/CAGUIAO/i);
    expect(parsed.subdivision).toMatch(/KATARUNGAN VILL/i);
    expect(parsed.barangay).toBeUndefined();
  });

  it('recovers a UMID CRN when OCR swaps I and L for 1', () => {
    expect(extractIdNumber(umidOcr)).toBe('0111-3134005-2');
    const parsed = parseIdText(umidOcr);
    expect(parsed.idType).toBe('umid');
    expect(parsed.firstName).toBe('JUSTFER');
    expect(parsed.middleName).toBe('DETALLA');
    expect(parsed.lastName).toBe('HIMNBING');
    expect(parsed.building).toMatch(/BLK 08 LOT 09/i);
    expect(parsed.subdivision).toMatch(/KATARUNGAN VILL/i);
    expect(parsed.barangay).toBeUndefined();
  });

  it('keeps the cleaner name when two OCR passes disagree', () => {
    const merged = mergeParsedId(
      { lastName: 'HIMNBING', firstName: 'JUSTFER' },
      { lastName: 'HIMBING', idNumber: '0111-8634005-2' },
    );
    expect(merged.lastName).toBe('HIMBING');
    expect(merged.firstName).toBe('JUSTFER');
    expect(merged.idNumber).toBe('0111-8634005-2');
  });
});

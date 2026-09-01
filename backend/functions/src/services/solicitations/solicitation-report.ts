/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { brand } from '../../config/brand';
import { HttpError } from '../../utils/errors';
import { SOLICITATION_KINDS, SOLICITATION_STATUSES, type SolicitationRecord } from './solicitation-types';

export const SOLICITATION_REPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const;
export type SolicitationReportFormat = (typeof SOLICITATION_REPORT_FORMATS)[number];

export type SolicitationReportFile = {
  filename: string;
  mime: string;
  bytes: Buffer;
  csv?: string;
};

const ALLOTTED = 500_000;
const MANILA = 'Asia/Manila';

const STATUS_LABEL: Record<SolicitationRecord['status'], string> = {
  under_review: 'Pending for Review',
  pending_validation: 'For Approval',
  rejected: 'Not Eligible',
  eligible: 'Eligible',
  ready_to_claim: 'Ready for Claim',
  claimed: 'Claimed',
};

const KIND_LABEL: Record<SolicitationRecord['kind'], string> = {
  burial: 'Burial',
  education: 'Educational',
  medical: 'Medical',
  events: 'Events',
  financial: 'Financial',
  daily: 'Daily',
};

const CSV_HEADER = [
  'controlNumber',
  'status',
  'kind',
  'requesterName',
  'beneficiaryName',
  'barangay',
  'reviewer',
  'accountant',
  'expedited',
  'escalated',
  'flags',
  'attentionMarks',
  'findingNote',
  'adminFindingNote',
  'accountantNote',
  'fundAmount',
  'createdAt',
  'claimedAt',
] as const;

const CASE_COLUMNS = [
  'Date requested',
  'Control no.',
  'Requestor',
  'Beneficiary',
  'Barangay',
  'Type',
  'Status',
  'Amount',
  'Reviewer',
  'Accountant',
] as const;

const MIME: Record<SolicitationReportFormat, string> = {
  csv: 'text/csv;charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

export function parseSolicitationReportFormat(raw: unknown): SolicitationReportFormat {
  if (raw === undefined || raw === '') return 'csv';
  if (typeof raw === 'string' && SOLICITATION_REPORT_FORMATS.includes(raw as SolicitationReportFormat)) {
    return raw as SolicitationReportFormat;
  }
  throw new HttpError(400, 'Unknown report format');
}

export function buildSolicitationReport(rows: SolicitationRecord[]): string {
  const lines = rows.map((row) =>
    [
      row.controlNumber,
      row.status,
      row.kind,
      row.requesterName,
      row.beneficiaryName,
      row.barangay,
      row.assignedReviewerName,
      row.assignedAccountantName,
      row.expedited ? 'yes' : 'no',
      row.escalated ? 'yes' : 'no',
      row.flags.map((flag) => flag.type).join('|'),
      (row.attentionMarks ?? []).join('|'),
      row.findingNote ?? '',
      row.adminFindingNote ?? '',
      row.accountantNote ?? '',
      row.fundAmount ?? 0,
      row.createdAt,
      row.claimedAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [CSV_HEADER.join(','), ...lines].join('\n');
}

export function buildSolicitationExport(
  rows: SolicitationRecord[],
  format: SolicitationReportFormat,
  now = new Date(),
): SolicitationReportFile {
  const stamp = manilaDayStamp(now);
  if (format === 'csv') {
    const csv = buildSolicitationReport(rows);
    return {
      filename: `solicitations-${stamp}.csv`,
      mime: MIME.csv,
      bytes: Buffer.from(`\uFEFF${csv}`, 'utf8'),
      csv,
    };
  }
  if (format === 'xlsx') {
    return {
      filename: `solicitations-${stamp}.xlsx`,
      mime: MIME.xlsx,
      bytes: buildWorkbook(rows, now),
    };
  }
  return {
    filename: `solicitation-statement-${stamp}.pdf`,
    mime: MIME.pdf,
    bytes: buildStatementPdf(rows, now),
  };
}

type Statement = {
  generated: string;
  caseCount: number;
  allotted: number;
  claimed: number;
  readyToClaim: number;
  remaining: number;
  byStatus: { code: SolicitationRecord['status']; label: string; count: number }[];
  byKind: { code: SolicitationRecord['kind']; label: string; count: number }[];
  cases: string[][];
};

function buildStatement(rows: SolicitationRecord[], now: Date): Statement {
  const claimed = sumFund(rows, 'claimed');
  const readyToClaim = sumFund(rows, 'ready_to_claim');
  return {
    generated: manilaDateTime(now),
    caseCount: rows.length,
    allotted: ALLOTTED,
    claimed,
    readyToClaim,
    remaining: ALLOTTED - claimed - readyToClaim,
    byStatus: SOLICITATION_STATUSES.map((code) => ({
      code,
      label: STATUS_LABEL[code],
      count: rows.filter((row) => row.status === code).length,
    })),
    byKind: SOLICITATION_KINDS.map((code) => ({
      code,
      label: KIND_LABEL[code],
      count: rows.filter((row) => row.kind === code).length,
    })),
    cases: rows
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((row) => [
        manilaDay(row.createdAt),
        row.controlNumber || '—',
        row.requesterName,
        row.beneficiaryName,
        row.barangay,
        KIND_LABEL[row.kind],
        STATUS_LABEL[row.status],
        money(row.fundAmount ?? 0),
        row.assignedReviewerName || '—',
        row.assignedAccountantName || '—',
      ]),
  };
}

function sumFund(rows: SolicitationRecord[], status: SolicitationRecord['status']): number {
  return rows.reduce((sum, row) => (row.status === status ? sum + (row.fundAmount || 0) : sum), 0);
}

function money(value: number): string {
  return `PHP ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function manilaDay(iso: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: MANILA,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

function manilaDateTime(now: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: MANILA,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
}

function manilaDayStamp(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: MANILA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .replaceAll('-', '');
}

function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colLetter(index: number): string {
  let n = index + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function inlineRow(rowIndex: number, values: string[]): string {
  const cells = values
    .map((value, col) => {
      const ref = `${colLetter(col)}${rowIndex}`;
      return `<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
    })
    .join('');
  return `<row r="${rowIndex}">${cells}</row>`;
}

function sheetXml(rows: string[][]): string {
  const data = rows.map((row, index) => inlineRow(index + 1, row)).join('');
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<sheetData>${data}</sheetData></worksheet>`
  );
}

function buildWorkbook(rows: SolicitationRecord[], now: Date): Buffer {
  const statement = buildStatement(rows, now);
  const summary: string[][] = [
    [brand.productName],
    ['Solicitation statement'],
    [`Generated ${statement.generated} (Asia/Manila)`],
    [`Cases in this report: ${String(statement.caseCount)}`],
    [],
    ['Solicitation fund'],
    ['Allotted', money(statement.allotted)],
    ['Claimed', money(statement.claimed)],
    ['Ready for Claim', money(statement.readyToClaim)],
    ['Remaining', money(statement.remaining)],
    [],
    ['Status', 'Count'],
    ...statement.byStatus.map((item) => [item.label, String(item.count)]),
    [],
    ['Type', 'Count'],
    ...statement.byKind.map((item) => [item.label, String(item.count)]),
  ];
  const cases: string[][] = [[...CASE_COLUMNS], ...statement.cases];
  return zipStore([
    { name: '[Content_Types].xml', data: contentTypesXml() },
    { name: '_rels/.rels', data: packageRelsXml() },
    { name: 'xl/workbook.xml', data: workbookXml() },
    { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml() },
    { name: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheetXml(summary), 'utf8') },
    { name: 'xl/worksheets/sheet2.xml', data: Buffer.from(sheetXml(cases), 'utf8') },
  ]);
}

function contentTypesXml(): Buffer {
  return Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '</Types>',
    'utf8',
  );
}

function packageRelsXml(): Buffer {
  return Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>',
    'utf8',
  );
}

function workbookXml(): Buffer {
  return Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets>' +
      '<sheet name="Statement" sheetId="1" r:id="rId1"/>' +
      '<sheet name="Cases" sheetId="2" r:id="rId2"/>' +
      '</sheets></workbook>',
    'utf8',
  );
}

function workbookRelsXml(): Buffer {
  return Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' +
      '</Relationships>',
    'utf8',
  );
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStore(files: { name: string; data: Buffer }[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8');
    const crc = crc32(file.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(file.data.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const localFull = Buffer.concat([local, name, file.data]);
    locals.push(localFull);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(file.data.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, name]));
    offset += localFull.length;
  }
  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralDir, eocd]);
}

type PdfOp = string;

function pdfEscape(value: string): string {
  const normalized = value
    .replaceAll('₱', 'PHP ')
    .replaceAll('—', '-')
    .replaceAll('–', '-')
    .replaceAll('’', "'")
    .replaceAll('“', '"')
    .replaceAll('”', '"');
  let out = '';
  for (const char of normalized) {
    const code = char.charCodeAt(0);
    if (char === '\\' || char === '(' || char === ')') {
      out += `\\${char}`;
    } else if (code >= 32 && code <= 126) {
      out += char;
    } else if (code <= 255) {
      out += `\\${code.toString(8).padStart(3, '0')}`;
    } else {
      out += '?';
    }
  }
  return out;
}

function pdfText(font: 'F1' | 'F2', size: number, x: number, y: number, value: string): PdfOp {
  return `BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm (${pdfEscape(value)}) Tj ET`;
}

function clip(value: string, max: number): string {
  const text = value.trim() || '-';
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(1, max - 3))}...`;
}

function tableCells(ops: PdfOp[], cells: string[], lineY: number) {
  const cols: { x: number; max: number }[] = [
    { x: 52, max: 11 },
    { x: 112, max: 12 },
    { x: 186, max: 13 },
    { x: 266, max: 13 },
    { x: 346, max: 10 },
    { x: 412, max: 9 },
    { x: 462, max: 12 },
    { x: 536, max: 9 },
  ];
  cells.forEach((cell, index) => {
    const col = cols[index];
    if (!col) return;
    ops.push(pdfText('F1', 7.5, col.x, lineY, clip(cell, col.max)));
  });
}

function buildStatementPdf(rows: SolicitationRecord[], now: Date): Buffer {
  const statement = buildStatement(rows, now);
  const pages: string[] = [];
  let ops: PdfOp[] = [];
  let y = 0;

  const flush = () => {
    pages.push(`${ops.join('\n')}\n`);
    ops = [];
  };

  const startPage = (continued: boolean) => {
    ops.push('0.059 0.298 0.506 rg 0 736 612 56 re f');
    ops.push('1 1 1 rg');
    ops.push(pdfText('F2', 16, 48, 764, brand.productName));
    ops.push(pdfText('F1', 10, 48, 746, continued ? 'Solicitation statement  -  continued' : 'Solicitation statement'));
    ops.push('0 0 0 rg');
    y = 716;
  };

  const drawTableHeader = () => {
    ops.push(`0.059 0.298 0.506 rg 48 ${y - 3} 516 14 re f 1 1 1 rg`);
    tableCells(ops, ['Date', 'Control no.', 'Requestor', 'Beneficiary', 'Barangay', 'Type', 'Status', 'Amount'], y);
    ops.push('0 0 0 rg');
    y -= 16;
  };

  const need = (height: number, withTableHead = false) => {
    if (y - height >= 40) return;
    flush();
    startPage(true);
    if (withTableHead) drawTableHeader();
  };

  startPage(false);
  ops.push(pdfText('F1', 9, 48, y, `Generated ${statement.generated}  -  Asia/Manila`));
  y -= 14;
  ops.push(pdfText('F1', 9, 48, y, `Cases in this report: ${statement.caseCount}`));
  y -= 22;
  ops.push(`0.93 0.94 0.96 rg 48 ${(y - 58).toFixed(1)} 516 72 re f 0 0 0 rg`);
  ops.push(pdfText('F2', 10, 56, y, 'Solicitation fund'));
  y -= 14;
  const fundLines: [string, number][] = [
    ['Allotted', statement.allotted],
    ['Claimed', statement.claimed],
    ['Ready for Claim', statement.readyToClaim],
    ['Remaining', statement.remaining],
  ];
  fundLines.forEach(([label, amount], index) => {
    const x = index < 2 ? 56 : 300;
    const lineY = y - (index % 2) * 14;
    ops.push(pdfText('F1', 9, x, lineY, `${label}:  ${money(amount)}`));
  });
  y -= 50;
  ops.push(pdfText('F2', 10, 48, y, 'Status'));
  y -= 14;
  statement.byStatus.forEach((item, index) => {
    const x = 48 + (index % 2) * 260;
    if (index % 2 === 0) need(14);
    ops.push(pdfText('F1', 9, x, y, `${item.label}:  ${item.count}`));
    if (index % 2 === 1) y -= 13;
  });
  if (statement.byStatus.length % 2 === 1) y -= 13;
  y -= 8;
  ops.push(pdfText('F2', 10, 48, y, 'Cases'));
  y -= 16;
  need(16);
  drawTableHeader();
  if (statement.cases.length === 0) {
    need(14, true);
    ops.push(pdfText('F1', 9, 48, y, 'No cases in this report.'));
  } else {
    for (const row of statement.cases) {
      need(14, true);
      ops.push(`0.90 0.91 0.93 RG 0.3 w 48 ${y - 3} 516 14 re S 0 0 0 rg`);
      tableCells(ops, row.slice(0, 8), y);
      y -= 14;
    }
  }
  flush();
  return assemblePdf(pages);
}

function assemblePdf(streams: string[]): Buffer {
  const kids = streams.map((_, index) => `${5 + index * 2} 0 R`).join(' ');
  const catalog = '<< /Type /Catalog /Pages 2 0 R >>';
  const pages = `<< /Type /Pages /Kids [${kids}] /Count ${streams.length} >>`;
  const font = (name: string) =>
    `<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`;
  const objects: string[] = [catalog, pages, font('Helvetica'), font('Helvetica-Bold')];
  streams.forEach((stream, index) => {
    const contentId = 6 + index * 2;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    const length = Buffer.byteLength(stream, 'latin1');
    objects.push(`<< /Length ${length} >>\nstream\n${stream}endstream`);
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((body) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${offsets.length - 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefAt = Buffer.byteLength(pdf, 'latin1');
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `${xref}trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

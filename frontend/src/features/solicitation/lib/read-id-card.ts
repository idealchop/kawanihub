/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */
import { mergeParsedId, parseIdText, parsedIdHasFields, type ParsedIdFields } from './parse-id-text';
import { prepareIdForOcr } from './prepare-id-for-ocr';

const OCR_MS = 45_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function recognizePasses(input: string | File | Blob): Promise<ParsedIdFields> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  try {
    await worker.setParameters({ tessedit_pageseg_mode: '6' });
    const block = await worker.recognize(input);
    await worker.setParameters({ tessedit_pageseg_mode: '4' });
    const column = await worker.recognize(input);
    return mergeParsedId(parseIdText(block.data.text ?? ''), parseIdText(column.data.text ?? ''));
  } finally {
    await worker.terminate();
  }
}

export async function readIdCard(source: string | File | Blob): Promise<ParsedIdFields> {
  const input = typeof source === 'string' ? await prepareIdForOcr(source) : source;
  return withTimeout(recognizePasses(input), OCR_MS);
}

export { parsedIdHasFields };
export type { ParsedIdFields };

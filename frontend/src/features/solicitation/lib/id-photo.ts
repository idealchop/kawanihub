/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

export const ID_PHOTO_MAX_DATA_URL = 1_100_000;
export const PAPER_PHOTO_MAX_DATA_URL = 650_000;
const QUALITIES = [0.7, 0.55, 0.4, 0.28];
const EDGES = [1280, 960, 720, 480];

export type IdPhotoErrorCode = 'type' | 'decode' | 'too_large';

export class IdPhotoError extends Error {
  readonly code: IdPhotoErrorCode;
  constructor(code: IdPhotoErrorCode) {
    super(code);
    this.name = 'IdPhotoError';
    this.code = code;
  }
}

/** iOS camera files often have an empty MIME type. */
export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  if (!file.type) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
}

function sourceSize(source: CanvasImageSource & { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number }) {
  const width = source.naturalWidth || source.width || 0;
  const height = source.naturalHeight || source.height || 0;
  return { width, height };
}

function scaleCanvas(source: CanvasImageSource, width: number, height: number, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(width, height, 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new IdPhotoError('decode');
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function encodeJpeg(canvas: HTMLCanvasElement, maxLength = ID_PHOTO_MAX_DATA_URL): string | undefined {
  for (const quality of QUALITIES) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.startsWith('data:image/') && dataUrl.length <= maxLength) return dataUrl;
  }
  return undefined;
}

function toPhoto(
  source: CanvasImageSource,
  width: number,
  height: number,
  name: string,
  maxLength = ID_PHOTO_MAX_DATA_URL,
): { name: string; dataUrl: string } {
  if (!width || !height) throw new IdPhotoError('decode');
  for (const edge of EDGES) {
    const dataUrl = encodeJpeg(scaleCanvas(source, width, height, edge), maxLength);
    if (dataUrl) return { name: (name || 'paper.jpg').slice(0, 160), dataUrl };
  }
  throw new IdPhotoError('too_large');
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new IdPhotoError('decode'));
    };
    image.src = url;
  });
}

async function decodeImage(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = sourceSize(bitmap);
      if (width && height) return { source: bitmap, width, height, close: () => bitmap.close() };
      bitmap.close();
    } catch {
      // iOS HEIC / empty-type camera files often fail here.
    }
  }
  const image = await loadImageElement(file);
  const { width, height } = sourceSize(image);
  return { source: image, width, height };
}

export async function readIdPhoto(file: File, maxLength = ID_PHOTO_MAX_DATA_URL): Promise<{ name: string; dataUrl: string }> {
  if (!isLikelyImageFile(file)) throw new IdPhotoError('type');
  const decoded = await decodeImage(file);
  try {
    return toPhoto(decoded.source, decoded.width, decoded.height, file.name, maxLength);
  } finally {
    decoded.close?.();
  }
}

export async function readPaperPhoto(file: File): Promise<{ name: string; dataUrl: string }> {
  return readIdPhoto(file, PAPER_PHOTO_MAX_DATA_URL);
}

export async function makeDummyPaperPhoto(label: string): Promise<{ name: string; dataUrl: string }> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 400;
  const context = canvas.getContext('2d');
  if (!context) throw new IdPhotoError('decode');
  context.fillStyle = '#1e3a5f';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.font = '28px sans-serif';
  context.fillText('DEMO', 40, 80);
  context.font = '22px sans-serif';
  context.fillText(label.slice(0, 42), 40, 140);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));
  if (!blob) throw new IdPhotoError('decode');
  const file = new File([blob], `${label.replace(/[^a-z0-9]+/gi, '-').slice(0, 40) || 'paper'}.jpg`, { type: 'image/jpeg' });
  return readPaperPhoto(file);
}

const FRAME_WIDTH = 0.9;
const FRAME_HEIGHT = 0.72;

export function readIdFrame(video: HTMLVideoElement): { name: string; dataUrl: string } {
  if (!video.videoWidth || !video.videoHeight) throw new IdPhotoError('decode');
  const width = Math.round(video.videoWidth * FRAME_WIDTH);
  const height = Math.round(video.videoHeight * FRAME_HEIGHT);
  const sx = Math.round((video.videoWidth - width) / 2);
  const sy = Math.round((video.videoHeight - height) / 2);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new IdPhotoError('decode');
  context.drawImage(video, sx, sy, width, height, 0, 0, width, height);
  return toPhoto(canvas, width, height, 'id-scan.jpg');
}

/**
 * Copyright (c) 2026 River Tech. All rights reserved.
 */

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read the photo.'));
    image.src = dataUrl;
  });
}

/** Upscale a compressed preview. Do not threshold — UMID ink sits on a busy pattern. */
export async function prepareIdForOcr(dataUrl: string): Promise<string> {
  if (typeof document === 'undefined') return dataUrl;
  const image = await loadImage(dataUrl);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = Math.min(2, 1800 / Math.max(width, 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

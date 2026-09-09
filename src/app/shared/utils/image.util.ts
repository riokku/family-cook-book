/**
 * Downscales an image to fit within `maxEdge` on its longest side and
 * re-encodes it as JPEG.
 *
 * Phone cameras produce 3-12MB photos. Shrinking before upload or transmission
 * keeps stored files small and requests fast, and 1600px is still well beyond
 * what a recipe card or a page thumbnail needs.
 */
export async function downscaleImage(
  file: File,
  maxEdge = 1600,
  quality = 0.85
): Promise<Blob> {
  // `from-image` honours the EXIF orientation phones write, so a photo taken
  // sideways is uprighted rather than kept rotated.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Could not process that image.')),
      'image/jpeg',
      quality
    );
  });
}

/** Base64 contents of a blob, with the `data:<mime>;base64,` prefix stripped. */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

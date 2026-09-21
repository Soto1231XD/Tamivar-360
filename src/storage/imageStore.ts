import { db } from "./db";
import { createId } from "@/utils/id";
import { generateThumbnail } from "@/utils/image";

/**
 * Cache de Object URLs en memoria. Un mismo imageId nunca genera más de un
 * URL activo simultáneamente; los consumidores deben liberar su referencia
 * con releaseImageUrl cuando la escena deja de estar montada.
 */
const urlCache = new Map<string, { url: string; refCount: number }>();

export async function saveImage(file: File | Blob): Promise<string> {
  const id = createId("img");
  await db.images.put({ id, blob: file, isThumbnail: false, createdAt: new Date().toISOString() });
  return id;
}

export async function saveThumbnailFor(imageId: string, source: Blob): Promise<string> {
  const thumbBlob = await generateThumbnail(source);
  const id = createId("thumb");
  await db.images.put({ id, blob: thumbBlob, isThumbnail: true, createdAt: new Date().toISOString() });
  void imageId;
  return id;
}

export async function getImageBlob(imageId: string): Promise<Blob | undefined> {
  const record = await db.images.get(imageId);
  return record?.blob;
}

/** Devuelve un Object URL reutilizable; incrementa el contador de referencias. */
export async function acquireImageUrl(imageId: string): Promise<string | null> {
  const cached = urlCache.get(imageId);
  if (cached) {
    cached.refCount += 1;
    return cached.url;
  }
  const blob = await getImageBlob(imageId);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(imageId, { url, refCount: 1 });
  return url;
}

/** Libera una referencia; revoca el Object URL sólo cuando ya nadie lo usa. */
export function releaseImageUrl(imageId: string): void {
  const cached = urlCache.get(imageId);
  if (!cached) return;
  cached.refCount -= 1;
  if (cached.refCount <= 0) {
    URL.revokeObjectURL(cached.url);
    urlCache.delete(imageId);
  }
}

export async function deleteImage(imageId: string): Promise<void> {
  const cached = urlCache.get(imageId);
  if (cached) {
    URL.revokeObjectURL(cached.url);
    urlCache.delete(imageId);
  }
  await db.images.delete(imageId);
}

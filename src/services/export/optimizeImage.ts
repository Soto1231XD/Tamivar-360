export interface ImageOptimizeOptions {
  maxWidth: number;
  quality: number;
}

/** Panorámicas 360°: 2048 px de ancho se ve nítido en pantallas comunes y pesa mucho menos que 4096. */
export const PANORAMA_EXPORT_OPTIONS: ImageOptimizeOptions = { maxWidth: 2048, quality: 0.8 };
/** Fotografías normales: suficiente para pantalla completa sin inflar el archivo. */
export const IMAGE_EXPORT_OPTIONS: ImageOptimizeOptions = { maxWidth: 1600, quality: 0.8 };

/**
 * Reduce dimensiones y recomprime a JPEG. Mantiene la proporción, por lo que
 * una panorámica 2:1 sigue siendo 2:1.
 */
export async function optimizeImageForExport(source: Blob, options: ImageOptimizeOptions): Promise<Blob> {
  const url = URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen para exportar"));
      el.src = url;
    });

    const scale = Math.min(1, options.maxWidth / img.naturalWidth);
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no soportado");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", options.quality)
    );
    if (!blob) throw new Error("No se pudo comprimir la imagen");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

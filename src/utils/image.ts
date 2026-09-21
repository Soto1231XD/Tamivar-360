export interface ImageAnalysis {
  width: number;
  height: number;
  aspectRatioIsEquirectangular: boolean;
  hasGPanoMetadata: boolean;
  /** Sugerencia, nunca una decisión forzada: el usuario siempre puede cambiarla. */
  suggestedType: "panorama" | "image";
}

const EQUIRECTANGULAR_RATIO = 2;
const EQUIRECTANGULAR_TOLERANCE = 0.05;

/** Lee dimensiones reales decodificando la imagen en el navegador. */
function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

/**
 * Búsqueda ligera de metadata XMP GPano (Google Photo Sphere) dentro de los
 * primeros bytes del archivo. No es un parser EXIF/XMP completo: sólo busca
 * la firma de texto que las cámaras/apps 360° incluyen, como señal adicional
 * (nunca la única) para sugerir que una imagen es panorámica.
 */
async function hasGPanoSignature(file: File): Promise<boolean> {
  // XMP suele vivir en los primeros ~128KB de un JPEG.
  const headerSlice = file.slice(0, 131072);
  const text = await headerSlice.text();
  return (
    text.includes("GPano:ProjectionType") ||
    text.includes("equirectangular") ||
    text.includes("UsePanoramaViewer")
  );
}

export async function analyzeImage(file: File): Promise<ImageAnalysis> {
  const [{ width, height }, hasGPanoMetadata] = await Promise.all([
    readImageDimensions(file),
    hasGPanoSignature(file).catch(() => false),
  ]);

  const ratio = width / height;
  const aspectRatioIsEquirectangular =
    Math.abs(ratio - EQUIRECTANGULAR_RATIO) <= EQUIRECTANGULAR_RATIO * EQUIRECTANGULAR_TOLERANCE;

  const suggestedType: "panorama" | "image" =
    hasGPanoMetadata || aspectRatioIsEquirectangular ? "panorama" : "image";

  return { width, height, aspectRatioIsEquirectangular, hasGPanoMetadata, suggestedType };
}

/** Genera una miniatura JPEG comprimida a partir de un archivo/blob de imagen. */
export async function generateThumbnail(source: Blob, maxWidth = 480): Promise<Blob> {
  const url = URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo generar la miniatura"));
      el.src = url;
    });

    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no soportado");
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.72)
    );
    if (!blob) throw new Error("No se pudo generar la miniatura");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

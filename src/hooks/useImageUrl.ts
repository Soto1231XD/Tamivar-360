import { useEffect, useState } from "react";
import { acquireImageUrl, releaseImageUrl } from "@/storage/imageStore";

/**
 * Resuelve un imageId a un Object URL utilizable en <img>/Pannellum,
 * liberando la referencia automáticamente al desmontar o cambiar de imagen.
 */
export function useImageUrl(imageId: string | undefined | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    let acquiredId: string | null = null;

    acquireImageUrl(imageId).then((resolved) => {
      if (cancelled) {
        if (resolved) releaseImageUrl(imageId);
        return;
      }
      acquiredId = imageId;
      setUrl(resolved);
    });

    return () => {
      cancelled = true;
      if (acquiredId) releaseImageUrl(acquiredId);
    };
  }, [imageId]);

  return url;
}

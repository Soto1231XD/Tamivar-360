import pannellumJs from "pannellum/build/pannellum.js?raw";
import pannellumCss from "pannellum/build/pannellum.css?raw";
import tourRuntimeJs from "./runtime/tour-runtime.js?raw";
import tourRuntimeCss from "./runtime/tour-runtime.css?raw";
import { getImageBlob } from "@/storage/imageStore";
import { blobToDataUrl } from "@/utils/image";
import { buildExportProject } from "./buildExportData";
import { buildTourHtmlDocument } from "./htmlDocument";
import { IMAGE_EXPORT_OPTIONS, PANORAMA_EXPORT_OPTIONS, optimizeImageForExport } from "./optimizeImage";
import type { Project } from "@/types";

/**
 * Genera un único archivo tour.html autónomo, con las imágenes incrustadas
 * como Base64. Las fotos se reducen (ancho máximo + compresión) para que el
 * archivo quepa en plataformas con límite de tamaño.
 */
export async function exportProjectAsStandaloneHtml(project: Project): Promise<Blob> {
  const imageCache = new Map<string, string>();

  const resolveImage = async (imageId: string, role: "image" | "thumbnail", sceneType: "panorama" | "image") => {
    if (!imageId) return "";
    const cacheKey = `${imageId}:${role}`;
    const cached = imageCache.get(cacheKey);
    if (cached) return cached;

    const blob = await getImageBlob(imageId);
    if (!blob) return "";

    const optimized =
      role === "thumbnail"
        ? blob
        : await optimizeImageForExport(
            blob,
            sceneType === "panorama" ? PANORAMA_EXPORT_OPTIONS : IMAGE_EXPORT_OPTIONS
          );
    const dataUrl = await blobToDataUrl(optimized);
    imageCache.set(cacheKey, dataUrl);
    return dataUrl;
  };

  const exportProject = await buildExportProject(project, (imageId, role, scene) =>
    resolveImage(imageId, role, scene.type)
  );

  const html = buildTourHtmlDocument({
    title: project.name,
    inlineCss: [pannellumCss, tourRuntimeCss],
    inlineScripts: [pannellumJs, tourRuntimeJs],
    tourData: { project: exportProject },
  });

  return new Blob([html], { type: "text/html" });
}

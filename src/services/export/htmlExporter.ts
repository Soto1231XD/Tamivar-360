import pannellumJs from "pannellum/build/pannellum.js?raw";
import pannellumCss from "pannellum/build/pannellum.css?raw";
import tourRuntimeJs from "./runtime/tour-runtime.js?raw";
import tourRuntimeCss from "./runtime/tour-runtime.css?raw";
import { getImageBlob } from "@/storage/imageStore";
import { blobToDataUrl } from "@/utils/image";
import { buildExportProject } from "./buildExportData";
import { buildTourHtmlDocument } from "./htmlDocument";
import type { Project } from "@/types";

/**
 * Genera un único archivo tour.html autónomo, con las imágenes incrustadas
 * como Base64. Ideal para recorridos pequeños que deben abrirse sin hosting.
 */
export async function exportProjectAsStandaloneHtml(project: Project): Promise<Blob> {
  const imageCache = new Map<string, string>();
  const resolveImage = async (imageId: string) => {
    if (!imageId) return "";
    const cached = imageCache.get(imageId);
    if (cached) return cached;
    const blob = await getImageBlob(imageId);
    if (!blob) return "";
    const dataUrl = await blobToDataUrl(blob);
    imageCache.set(imageId, dataUrl);
    return dataUrl;
  };

  const exportProject = await buildExportProject(project, resolveImage);

  const html = buildTourHtmlDocument({
    title: project.name,
    inlineCss: [pannellumCss, tourRuntimeCss],
    inlineScripts: [pannellumJs, tourRuntimeJs],
    tourData: { project: exportProject },
  });

  return new Blob([html], { type: "text/html" });
}

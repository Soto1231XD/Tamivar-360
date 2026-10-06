import JSZip from "jszip";
import pannellumJs from "pannellum/build/pannellum.js?raw";
import pannellumCss from "pannellum/build/pannellum.css?raw";
import tourRuntimeJs from "./runtime/tour-runtime.js?raw";
import tourRuntimeCss from "./runtime/tour-runtime.css?raw";
import { getImageBlob } from "@/storage/imageStore";
import { buildExportProject } from "./buildExportData";
import { buildTourHtmlDocument } from "./htmlDocument";
import { IMAGE_EXPORT_OPTIONS, PANORAMA_EXPORT_OPTIONS, optimizeImageForExport } from "./optimizeImage";
import { slugify } from "@/utils/slug";
import type { Project } from "@/types";

function extensionForBlob(blob: Blob): string {
  if (blob.type === "image/png") return "png";
  if (blob.type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Genera un ZIP de producción con index.html + assets/css/js como archivos
 * reales, recomendado para recorridos grandes con imágenes 360° pesadas.
 */
export async function exportProjectAsZip(project: Project): Promise<Blob> {
  const zip = new JSZip();
  const assetsFolder = zip.folder("assets");
  if (!assetsFolder) throw new Error("No se pudo crear la carpeta assets");

  const usedNames = new Set<string>();
  const blobCache = new Map<string, string>();

  const resolveImage = async (
    imageId: string,
    role: "image" | "thumbnail",
    scene: { name: string; id: string; type: "panorama" | "image" }
  ) => {
    if (!imageId) return "";
    const cacheKey = `${imageId}:${role}`;
    const cached = blobCache.get(cacheKey);
    if (cached) return cached;

    const original = await getImageBlob(imageId);
    if (!original) return "";

    const blob =
      role === "thumbnail"
        ? original
        : await optimizeImageForExport(
            original,
            scene.type === "panorama" ? PANORAMA_EXPORT_OPTIONS : IMAGE_EXPORT_OPTIONS
          );

    const ext = extensionForBlob(blob);
    const base = `${slugify(scene.name)}${role === "thumbnail" ? "-thumb" : ""}`;
    let fileName = `${base}.${ext}`;
    let counter = 1;
    while (usedNames.has(fileName)) fileName = `${base}-${counter++}.${ext}`;
    usedNames.add(fileName);

    assetsFolder.file(fileName, blob);
    const path = `assets/${fileName}`;
    blobCache.set(cacheKey, path);
    return path;
  };

  const exportProject = await buildExportProject(project, resolveImage);

  const cssFolder = zip.folder("css");
  const jsFolder = zip.folder("js");
  if (!cssFolder || !jsFolder) throw new Error("No se pudo crear la estructura del ZIP");

  cssFolder.file("styles.css", `${pannellumCss}\n${tourRuntimeCss}`);
  jsFolder.file("pannellum.js", pannellumJs);
  jsFolder.file("tour.js", tourRuntimeJs);

  const html = buildTourHtmlDocument({
    title: project.name,
    cssHrefs: ["css/styles.css"],
    scriptHrefs: ["js/pannellum.js", "js/tour.js"],
    tourData: { project: exportProject },
  });
  zip.file("index.html", html);

  return zip.generateAsync({ type: "blob" });
}

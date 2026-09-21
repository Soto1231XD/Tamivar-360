import JSZip from "jszip";
import { db } from "@/storage/db";
import { getImageBlob, saveImage } from "@/storage/imageStore";
import { createId } from "@/utils/id";
import type { Project } from "@/types";

const PROJECT_JSON_ENTRY = "project.json";

function extensionForBlob(blob: Blob): string {
  if (blob.type === "image/png") return "png";
  if (blob.type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Exporta un respaldo completo del proyecto (.tour): estructura + todas las
 * imágenes originales. Distinto de exportar el recorrido para el cliente
 * final — este archivo está pensado para reimportarse al editor.
 */
export async function exportProjectPackage(project: Project): Promise<Blob> {
  const zip = new JSZip();
  const imagesFolder = zip.folder("images");
  if (!imagesFolder) throw new Error("No se pudo crear la carpeta images");

  const imageIds = new Set<string>();
  if (project.coverImageId) imageIds.add(project.coverImageId);
  for (const scene of project.scenes) {
    imageIds.add(scene.imageId);
    imageIds.add(scene.thumbnailId);
  }

  const manifest: Record<string, string> = {};
  for (const imageId of imageIds) {
    const blob = await getImageBlob(imageId);
    if (!blob) continue;
    const fileName = `${imageId}.${extensionForBlob(blob)}`;
    imagesFolder.file(fileName, blob);
    manifest[imageId] = fileName;
  }

  zip.file(PROJECT_JSON_ENTRY, JSON.stringify({ project, manifest }, null, 2));
  return zip.generateAsync({ type: "blob" });
}

/**
 * Importa un .tour exportado previamente. Genera nuevos ids para el
 * proyecto, escenas e imágenes para evitar colisiones con datos locales
 * existentes, y remapea todas las referencias.
 */
export async function importProjectPackage(file: File): Promise<Project> {
  const zip = await JSZip.loadAsync(file);
  const manifestEntry = zip.file(PROJECT_JSON_ENTRY);
  if (!manifestEntry) throw new Error("El archivo no es un paquete de proyecto válido (.tour)");

  const { project, manifest } = JSON.parse(await manifestEntry.async("string")) as {
    project: Project;
    manifest: Record<string, string>;
  };

  const imageIdMap = new Map<string, string>();
  for (const [oldImageId, fileName] of Object.entries(manifest)) {
    const entry = zip.file(`images/${fileName}`);
    if (!entry) continue;
    const blob = await entry.async("blob");
    const newImageId = await saveImage(blob);
    imageIdMap.set(oldImageId, newImageId);
  }

  const sceneIdMap = new Map<string, string>();
  for (const scene of project.scenes) sceneIdMap.set(scene.id, createId("scene"));

  const scenes = project.scenes.map((scene) => ({
    ...scene,
    id: sceneIdMap.get(scene.id)!,
    imageId: imageIdMap.get(scene.imageId) ?? scene.imageId,
    thumbnailId: imageIdMap.get(scene.thumbnailId) ?? scene.thumbnailId,
    hotspots: scene.hotspots.map((h) => ({
      ...h,
      id: createId("hotspot"),
      ...(h.type === "navigation" ? { targetSceneId: sceneIdMap.get(h.targetSceneId) ?? h.targetSceneId } : {}),
    })),
  }));

  const now = new Date().toISOString();
  const imported: Project = {
    ...project,
    id: createId("project"),
    name: `${project.name} (importado)`,
    createdAt: now,
    updatedAt: now,
    coverImageId: project.coverImageId ? imageIdMap.get(project.coverImageId) : undefined,
    initialSceneId: project.initialSceneId ? sceneIdMap.get(project.initialSceneId) ?? null : null,
    scenes,
  };

  await db.projects.put(imported);
  return imported;
}

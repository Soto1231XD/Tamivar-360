import type { Hotspot, Project, Scene } from "@/types";

export interface ExportHotspot {
  id: string;
  type: "navigation" | "info";
  label: string;
  kind: "360" | "image";
  position: { pitch: number; yaw: number } | { x: number; y: number };
  targetSceneId?: string;
  title?: string;
  description?: string;
}

export interface ExportScene {
  id: string;
  name: string;
  type: "panorama" | "image";
  image: string;
  thumbnail: string;
  order: number;
  initialView?: { pitch: number; yaw: number; hfov: number };
  hotspots: ExportHotspot[];
}

export interface ExportProject {
  name: string;
  description: string;
  initialSceneId: string | null;
  settings: Project["settings"];
  scenes: ExportScene[];
}

function toExportHotspot(hotspot: Hotspot): ExportHotspot {
  return {
    id: hotspot.id,
    type: hotspot.type,
    label: hotspot.label,
    kind: hotspot.kind,
    position: hotspot.position,
    targetSceneId: hotspot.type === "navigation" ? hotspot.targetSceneId : undefined,
    title: hotspot.type === "info" ? hotspot.title : undefined,
    description: hotspot.type === "info" ? hotspot.description : undefined,
  };
}

export type ImageResolver = (imageId: string, role: "image" | "thumbnail", scene: Scene) => Promise<string>;

export async function buildExportProject(project: Project, resolveImage: ImageResolver): Promise<ExportProject> {
  const scenes: ExportScene[] = await Promise.all(
    [...project.scenes]
      .sort((a, b) => a.order - b.order)
      .map(async (scene) => ({
        id: scene.id,
        name: scene.name,
        type: scene.type,
        image: await resolveImage(scene.imageId, "image", scene),
        thumbnail: await resolveImage(scene.thumbnailId || scene.imageId, "thumbnail", scene),
        order: scene.order,
        initialView: scene.initialView,
        hotspots: scene.hotspots.map(toExportHotspot),
      }))
  );

  return {
    name: project.name,
    description: project.description,
    initialSceneId: project.initialSceneId,
    settings: project.settings,
    scenes,
  };
}

import { createId } from "@/utils/id";
import { DEFAULT_PROJECT_SETTINGS, type Project, type Scene, type SceneType } from "@/types";

export function createEmptyProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    id: createId("project"),
    name,
    description: "",
    createdAt: now,
    updatedAt: now,
    initialSceneId: null,
    scenes: [],
    settings: { ...DEFAULT_PROJECT_SETTINGS },
  };
}

export function createScene(params: {
  name: string;
  type: SceneType;
  imageId: string;
  thumbnailId: string;
  order: number;
}): Scene {
  return {
    id: createId("scene"),
    name: params.name,
    type: params.type,
    imageId: params.imageId,
    thumbnailId: params.thumbnailId,
    hotspots: [],
    order: params.order,
    initialView: params.type === "panorama" ? { pitch: 0, yaw: 0, hfov: 100 } : undefined,
  };
}

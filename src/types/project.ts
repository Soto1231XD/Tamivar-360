import type { Scene } from "./scene";

export interface ProjectSettings {
  autoRotate: boolean;
  showThumbnails: boolean;
  showRoomList: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  coverImageId?: string;
  /** Escena mostrada al abrir el recorrido. */
  initialSceneId: string | null;
  scenes: Scene[];
  settings: ProjectSettings;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  autoRotate: false,
  showThumbnails: true,
  showRoomList: true,
};

/** Metadatos ligeros usados en el listado de proyectos (sin cargar todas las escenas/imagenes). */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  coverImageId?: string;
  sceneCount: number;
}

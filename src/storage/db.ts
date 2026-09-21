import Dexie, { type Table } from "dexie";
import type { Project } from "@/types";

export interface StoredImage {
  id: string;
  blob: Blob;
  /** Miniatura pre-generada para listados rápidos (sidebar, grid de proyectos). */
  isThumbnail: boolean;
  createdAt: string;
}

class TamivarDatabase extends Dexie {
  projects!: Table<Project, string>;
  images!: Table<StoredImage, string>;

  constructor() {
    super("tamivar-360");
    this.version(1).stores({
      projects: "id, name, updatedAt",
      images: "id, isThumbnail",
    });
  }
}

export const db = new TamivarDatabase();

import { db } from "@/storage/db";
import { deleteImage, getImageBlob, saveImage } from "@/storage/imageStore";
import { createId } from "@/utils/id";
import type { Project, ProjectSummary } from "@/types";
import type { ProjectRepository } from "./ProjectRepository";

class LocalProjectRepository implements ProjectRepository {
  async list(): Promise<ProjectSummary[]> {
    const projects = await db.projects.orderBy("updatedAt").reverse().toArray();
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      coverImageId: project.coverImageId,
      sceneCount: project.scenes.length,
    }));
  }

  async get(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  }

  async create(project: Project): Promise<void> {
    await db.projects.put(project);
  }

  async update(project: Project): Promise<void> {
    await db.projects.put({ ...project, updatedAt: new Date().toISOString() });
  }

  async remove(id: string): Promise<void> {
    const project = await db.projects.get(id);
    if (project) {
      const imageIds = new Set<string>();
      if (project.coverImageId) imageIds.add(project.coverImageId);
      for (const scene of project.scenes) {
        imageIds.add(scene.imageId);
        imageIds.add(scene.thumbnailId);
      }
      await Promise.all([...imageIds].map((imageId) => deleteImage(imageId)));
    }
    await db.projects.delete(id);
  }

  async duplicate(id: string, newName: string): Promise<Project> {
    const original = await db.projects.get(id);
    if (!original) throw new Error("Proyecto no encontrado");

    const cloneImage = async (imageId: string) => {
      const blob = await getImageBlob(imageId);
      if (!blob) return imageId;
      return saveImage(blob);
    };

    const scenes = await Promise.all(
      original.scenes.map(async (scene) => ({
        ...scene,
        id: createId("scene"),
        imageId: await cloneImage(scene.imageId),
        thumbnailId: await cloneImage(scene.thumbnailId),
        hotspots: scene.hotspots.map((h) => ({ ...h, id: createId("hotspot") })),
      }))
    );

    // Remapear targetSceneId de hotspots de navegación a los nuevos ids de escena.
    const idMap = new Map(original.scenes.map((s, i) => [s.id, scenes[i].id]));
    for (const scene of scenes) {
      scene.hotspots = scene.hotspots.map((h) =>
        h.type === "navigation" ? { ...h, targetSceneId: idMap.get(h.targetSceneId) ?? h.targetSceneId } : h
      );
    }

    const now = new Date().toISOString();
    const clone: Project = {
      ...original,
      id: createId("project"),
      name: newName,
      createdAt: now,
      updatedAt: now,
      coverImageId: original.coverImageId ? await cloneImage(original.coverImageId) : undefined,
      initialSceneId: original.initialSceneId ? idMap.get(original.initialSceneId) ?? null : null,
      scenes,
    };

    await db.projects.put(clone);
    return clone;
  }
}

export const localProjectRepository = new LocalProjectRepository();

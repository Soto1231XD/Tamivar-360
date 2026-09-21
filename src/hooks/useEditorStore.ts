import { create } from "zustand";
import { createId } from "@/utils/id";
import type { Hotspot, HotspotContent, ImagePosition, Panorama360Position, Project, ProjectSettings, Scene } from "@/types";

interface EditorState {
  project: Project | null;
  selectedSceneId: string | null;
  selectedHotspotId: string | null;

  loadProject: (project: Project) => void;
  clear: () => void;

  renameProject: (name: string) => void;
  updateDescription: (description: string) => void;
  updateSettings: (patch: Partial<ProjectSettings>) => void;
  setInitialScene: (sceneId: string) => void;

  selectScene: (sceneId: string | null) => void;
  addScenes: (scenes: Scene[]) => void;
  updateScene: (sceneId: string, patch: Partial<Scene>) => void;
  removeScene: (sceneId: string) => void;
  duplicateScene: (sceneId: string) => void;
  reorderScenes: (orderedIds: string[]) => void;

  selectHotspot: (hotspotId: string | null) => void;
  addHotspot: (sceneId: string, hotspot: Hotspot) => void;
  updateHotspot: (sceneId: string, hotspotId: string, patch: Partial<HotspotContent>) => void;
  moveHotspot: (sceneId: string, hotspotId: string, position: Panorama360Position | ImagePosition) => void;
  removeHotspot: (sceneId: string, hotspotId: string) => void;
}

function touch(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  selectedSceneId: null,
  selectedHotspotId: null,

  loadProject: (project) =>
    set({
      project,
      selectedSceneId: project.initialSceneId ?? project.scenes[0]?.id ?? null,
      selectedHotspotId: null,
    }),

  clear: () => set({ project: null, selectedSceneId: null, selectedHotspotId: null }),

  renameProject: (name) => {
    const { project } = get();
    if (!project) return;
    set({ project: touch({ ...project, name }) });
  },

  updateDescription: (description) => {
    const { project } = get();
    if (!project) return;
    set({ project: touch({ ...project, description }) });
  },

  updateSettings: (patch) => {
    const { project } = get();
    if (!project) return;
    set({ project: touch({ ...project, settings: { ...project.settings, ...patch } }) });
  },

  setInitialScene: (sceneId) => {
    const { project } = get();
    if (!project) return;
    set({ project: touch({ ...project, initialSceneId: sceneId }) });
  },

  selectScene: (sceneId) => set({ selectedSceneId: sceneId, selectedHotspotId: null }),

  addScenes: (scenes) => {
    const { project } = get();
    if (!project || scenes.length === 0) return;
    const isFirst = project.scenes.length === 0;
    set({
      project: touch({
        ...project,
        scenes: [...project.scenes, ...scenes],
        initialSceneId: isFirst ? scenes[0].id : project.initialSceneId,
      }),
      selectedSceneId: scenes[scenes.length - 1].id,
    });
  },

  updateScene: (sceneId, patch) => {
    const { project } = get();
    if (!project) return;
    set({
      project: touch({
        ...project,
        scenes: project.scenes.map((s) => (s.id === sceneId ? { ...s, ...patch } : s)),
      }),
    });
  },

  removeScene: (sceneId) => {
    const { project, selectedSceneId } = get();
    if (!project) return;
    const remainingScenes = project.scenes
      .filter((s) => s.id !== sceneId)
      // Elimina hotspots de navegación que apuntaban a la escena borrada.
      .map((s) => ({ ...s, hotspots: s.hotspots.filter((h) => !(h.type === "navigation" && h.targetSceneId === sceneId)) }));

    const initialSceneId =
      project.initialSceneId === sceneId ? remainingScenes[0]?.id ?? null : project.initialSceneId;

    set({
      project: touch({ ...project, scenes: remainingScenes, initialSceneId }),
      selectedSceneId: selectedSceneId === sceneId ? remainingScenes[0]?.id ?? null : selectedSceneId,
    });
  },

  duplicateScene: (sceneId) => {
    const { project } = get();
    if (!project) return;
    const original = project.scenes.find((s) => s.id === sceneId);
    if (!original) return;
    const clone: Scene = {
      ...original,
      id: createId("scene"),
      name: `${original.name} (copia)`,
      order: project.scenes.length,
      hotspots: original.hotspots.map((h) => ({ ...h, id: createId("hotspot") })),
    };
    set({
      project: touch({ ...project, scenes: [...project.scenes, clone] }),
      selectedSceneId: clone.id,
    });
  },

  reorderScenes: (orderedIds) => {
    const { project } = get();
    if (!project) return;
    const sceneById = new Map(project.scenes.map((s) => [s.id, s]));
    const scenes = orderedIds
      .map((id, index) => {
        const scene = sceneById.get(id);
        return scene ? { ...scene, order: index } : undefined;
      })
      .filter((s): s is Scene => !!s);
    set({ project: touch({ ...project, scenes }) });
  },

  selectHotspot: (hotspotId) => set({ selectedHotspotId: hotspotId }),

  addHotspot: (sceneId, hotspot) => {
    const { project } = get();
    if (!project) return;
    set({
      project: touch({
        ...project,
        scenes: project.scenes.map((s) =>
          s.id === sceneId ? { ...s, hotspots: [...s.hotspots, hotspot] } : s
        ),
      }),
      selectedHotspotId: hotspot.id,
    });
  },

  updateHotspot: (sceneId, hotspotId, patch) => {
    const { project } = get();
    if (!project) return;
    set({
      project: touch({
        ...project,
        scenes: project.scenes.map((s) =>
          s.id !== sceneId
            ? s
            : {
                ...s,
                hotspots: s.hotspots.map((h) => (h.id === hotspotId ? ({ ...h, ...patch } as Hotspot) : h)),
              }
        ),
      }),
    });
  },

  moveHotspot: (sceneId, hotspotId, position) => {
    const { project } = get();
    if (!project) return;
    set({
      project: touch({
        ...project,
        scenes: project.scenes.map((s) =>
          s.id !== sceneId
            ? s
            : {
                ...s,
                hotspots: s.hotspots.map((h) => (h.id === hotspotId ? ({ ...h, position } as Hotspot) : h)),
              }
        ),
      }),
    });
  },

  removeHotspot: (sceneId, hotspotId) => {
    const { project, selectedHotspotId } = get();
    if (!project) return;
    set({
      project: touch({
        ...project,
        scenes: project.scenes.map((s) =>
          s.id === sceneId ? { ...s, hotspots: s.hotspots.filter((h) => h.id !== hotspotId) } : s
        ),
      }),
      selectedHotspotId: selectedHotspotId === hotspotId ? null : selectedHotspotId,
    });
  },
}));

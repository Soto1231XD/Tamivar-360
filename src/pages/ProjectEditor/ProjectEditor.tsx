import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { SceneList } from "@/components/editor/SceneList";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { PanoramaViewer } from "@/components/viewer/PanoramaViewer";
import { ImageSceneViewer } from "@/components/viewer/ImageSceneViewer";
import { AddSceneModal } from "@/components/scenes/AddSceneModal";
import { HotspotEditorModal } from "@/components/hotspots/HotspotEditorModal";
import { HotspotPlacementToolbar } from "@/components/hotspots/HotspotPlacementToolbar";
import { ProjectValidationPanel } from "@/components/project/ProjectValidationPanel";
import { ExportModal } from "@/components/export/ExportModal";
import { useEditorStore } from "@/hooks/useEditorStore";
import { useAutosave } from "@/hooks/useAutosave";
import { useImageUrl } from "@/hooks/useImageUrl";
import { useLoadedProject } from "@/hooks/useLoadedProject";
import type { Hotspot, ImagePosition, InitialView, Panorama360Position } from "@/types";

type PendingPosition = { kind: "360"; position: Panorama360Position } | { kind: "image"; position: ImagePosition };

export function ProjectEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project: loadedProject, loading, notFound } = useLoadedProject(projectId);

  const project = useEditorStore((s) => s.project);
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const selectedHotspotId = useEditorStore((s) => s.selectedHotspotId);
  const loadProject = useEditorStore((s) => s.loadProject);
  const clear = useEditorStore((s) => s.clear);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);
  const addScenes = useEditorStore((s) => s.addScenes);
  const addHotspot = useEditorStore((s) => s.addHotspot);
  const updateHotspot = useEditorStore((s) => s.updateHotspot);
  const moveHotspot = useEditorStore((s) => s.moveHotspot);
  const removeHotspot = useEditorStore((s) => s.removeHotspot);
  const updateScene = useEditorStore((s) => s.updateScene);

  const autosaveStatus = useAutosave(project);

  useEffect(() => {
    if (loadedProject) loadProject(loadedProject);
    return () => clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedProject]);

  const [addSceneOpen, setAddSceneOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<PendingPosition | null>(null);
  const [placementArmed, setPlacementArmed] = useState(false);
  const lastViewRef = useRef<InitialView | null>(null);

  const scene = useMemo(() => project?.scenes.find((s) => s.id === selectedSceneId) ?? null, [project, selectedSceneId]);

  // Cambiar de escena cancela cualquier colocación de hotspot en curso.
  useEffect(() => {
    setPlacementArmed(false);
  }, [selectedSceneId]);
  const imageUrl = useImageUrl(scene?.imageId);

  const editingHotspot: Hotspot | null = useMemo(
    () => scene?.hotspots.find((h) => h.id === selectedHotspotId) ?? null,
    [scene, selectedHotspotId]
  );

  const otherScenes = useMemo(() => project?.scenes.filter((s) => s.id !== scene?.id) ?? [], [project, scene]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-surface-950 text-surface-400">Cargando proyecto…</div>;
  }
  if (notFound || !project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-surface-950 text-surface-400">
        Proyecto no encontrado.
        <button className="text-accent-400 underline" onClick={() => navigate("/projects")}>
          Volver a proyectos
        </button>
      </div>
    );
  }

  const hotspotModalOpen = !!pendingPosition || !!editingHotspot;

  return (
    <div className="flex h-screen flex-col bg-surface-950">
      <EditorToolbar
        projectName={project.name}
        projectId={project.id}
        autosaveStatus={autosaveStatus}
        onValidate={() => setValidationOpen(true)}
        onExport={() => setExportOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-surface-800 bg-surface-900">
          <SceneList scenes={project.scenes} onAddScene={() => setAddSceneOpen(true)} />
        </aside>

        <main className="relative flex-1 bg-surface-950">
          {scene && imageUrl ? (
            <>
              <HotspotPlacementToolbar
                armed={placementArmed}
                onArm={() => setPlacementArmed(true)}
                onCancel={() => setPlacementArmed(false)}
              />
              {scene.type === "panorama" ? (
                <PanoramaViewer
                  key={scene.id}
                  imageUrl={imageUrl}
                  hotspots={scene.hotspots}
                  initialView={scene.initialView}
                  placementMode={placementArmed}
                  onSceneClick={(position) => {
                    setPendingPosition({ kind: "360", position });
                    setPlacementArmed(false);
                  }}
                  onHotspotClick={(id) => selectHotspot(id)}
                  onHotspotDragEnd={(id, position) => moveHotspot(scene.id, id, position)}
                  onViewChange={(view) => {
                    lastViewRef.current = view;
                  }}
                />
              ) : (
                <ImageSceneViewer
                  key={scene.id}
                  imageUrl={imageUrl}
                  sceneName={scene.name}
                  hotspots={scene.hotspots}
                  placementMode={placementArmed}
                  onSceneClick={(position) => {
                    setPendingPosition({ kind: "image", position });
                    setPlacementArmed(false);
                  }}
                  onHotspotClick={(id) => selectHotspot(id)}
                  onHotspotDragEnd={(id, position) => moveHotspot(scene.id, id, position)}
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center text-sm text-surface-500">
              {project.scenes.length === 0
                ? 'Agrega tu primera escena con el botón "+ Escena" para empezar a construir el recorrido.'
                : "Selecciona una escena para editarla."}
            </div>
          )}
        </main>

        <aside className="w-72 shrink-0 overflow-y-auto border-l border-surface-800 bg-surface-900">
          <SettingsPanel
            scene={scene}
            canCaptureInitialView={scene?.type === "panorama"}
            onCaptureInitialView={
              scene
                ? () => {
                    if (lastViewRef.current) updateScene(scene.id, { initialView: lastViewRef.current });
                  }
                : undefined
            }
          />
        </aside>
      </div>

      <AddSceneModal
        open={addSceneOpen}
        onClose={() => setAddSceneOpen(false)}
        nextOrder={project.scenes.length}
        onCreated={(scenes) => addScenes(scenes)}
      />

      <HotspotEditorModal
        open={hotspotModalOpen}
        onClose={() => {
          setPendingPosition(null);
          selectHotspot(null);
        }}
        availableScenes={otherScenes}
        pending={pendingPosition}
        editingHotspot={editingHotspot}
        onSave={(hotspot) => {
          if (!scene) return;
          if (editingHotspot) updateHotspot(scene.id, editingHotspot.id, hotspot);
          else addHotspot(scene.id, hotspot);
        }}
        onDelete={
          editingHotspot && scene
            ? () => {
                removeHotspot(scene.id, editingHotspot.id);
              }
            : undefined
        }
      />

      <ProjectValidationPanel open={validationOpen} onClose={() => setValidationOpen(false)} project={project} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} project={project} />
    </div>
  );
}

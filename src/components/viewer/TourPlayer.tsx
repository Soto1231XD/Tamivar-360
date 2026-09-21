import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Expand, List, Minimize } from "lucide-react";
import clsx from "clsx";
import { PanoramaViewer } from "./PanoramaViewer";
import { ImageSceneViewer } from "./ImageSceneViewer";
import { SceneHotspotInfoPanel } from "./SceneHotspotInfoPanel";
import { SceneThumbnails } from "./SceneThumbnails";
import { useImageUrl } from "@/hooks/useImageUrl";
import type { InfoHotspot, Project } from "@/types";

interface TourPlayerProps {
  project: Project;
  onExit?: () => void;
}

/** Duración del fundido al cambiar de escena, para que se sienta como un cambio de habitación y no un corte. */
const SCENE_FADE_MS = 320;

export function TourPlayer({ project, onExit }: TourPlayerProps) {
  const [currentSceneId, setCurrentSceneId] = useState(
    project.initialSceneId ?? project.scenes[0]?.id ?? ""
  );
  const [activeInfoHotspot, setActiveInfoHotspot] = useState<InfoHotspot | null>(null);
  const [roomListOpen, setRoomListOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fading, setFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  const scene = useMemo(
    () => project.scenes.find((s) => s.id === currentSceneId),
    [project.scenes, currentSceneId]
  );
  const imageUrl = useImageUrl(scene?.imageId);

  const orderedScenes = useMemo(() => [...project.scenes].sort((a, b) => a.order - b.order), [project.scenes]);

  const goToScene = (sceneId: string) => {
    if (sceneId === currentSceneId) {
      setRoomListOpen(false);
      return;
    }
    setRoomListOpen(false);
    setFading(true);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setActiveInfoHotspot(null);
      setCurrentSceneId(sceneId);
      // deja pintar la nueva escena tapada antes de destapar, para que no se note el "salto"
      requestAnimationFrame(() => requestAnimationFrame(() => setFading(false)));
    }, SCENE_FADE_MS);
  };

  const handleHotspotClick = (hotspotId: string) => {
    const hotspot = scene?.hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return;
    if (hotspot.type === "navigation") goToScene(hotspot.targetSceneId);
    else setActiveInfoHotspot(hotspot);
  };

  const toggleFullscreen = () => {
    const el = document.getElementById("tamivar-tour-root");
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (!scene) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-950 text-surface-400">
        Este recorrido todavía no tiene escenas.
      </div>
    );
  }

  return (
    <div id="tamivar-tour-root" className="relative flex h-full w-full flex-col bg-surface-950">
      <div className="relative flex-1 overflow-hidden">
        {imageUrl &&
          (scene.type === "panorama" ? (
            <PanoramaViewer
              key={scene.id}
              imageUrl={imageUrl}
              hotspots={scene.hotspots}
              initialView={scene.initialView}
              autoRotate={project.settings.autoRotate}
              onHotspotClick={handleHotspotClick}
            />
          ) : (
            <ImageSceneViewer
              key={scene.id}
              imageUrl={imageUrl}
              sceneName={scene.name}
              hotspots={scene.hotspots}
              onHotspotClick={handleHotspotClick}
            />
          ))}

        {/* Barra superior */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="pointer-events-auto flex items-center gap-2">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                aria-label="Volver"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-950/70 text-surface-100 backdrop-blur hover:bg-surface-900"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="rounded-full bg-surface-950/70 px-3.5 py-1.5 backdrop-blur">
              <p className="text-xs font-medium text-surface-300">{project.name}</p>
              <p className="text-sm font-semibold text-surface-50">{scene.name}</p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {project.settings.showRoomList && (
              <button
                type="button"
                onClick={() => setRoomListOpen((v) => !v)}
                aria-label="Ver habitaciones"
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors",
                  roomListOpen ? "bg-accent-500 text-surface-950" : "bg-surface-950/70 text-surface-100 hover:bg-surface-900"
                )}
              >
                <List size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Pantalla completa"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-950/70 text-surface-100 backdrop-blur hover:bg-surface-900"
            >
              {isFullscreen ? <Minimize size={16} /> : <Expand size={16} />}
            </button>
          </div>
        </div>

        {roomListOpen && (
          <div className="absolute right-3 top-16 z-20 max-h-[60%] w-56 overflow-y-auto rounded-xl border border-surface-700 bg-surface-900/95 p-2 shadow-2xl backdrop-blur">
            {orderedScenes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToScene(s.id)}
                className={clsx(
                  "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  s.id === currentSceneId
                    ? "bg-accent-500/15 text-accent-400"
                    : "text-surface-200 hover:bg-surface-800"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {activeInfoHotspot && (
          <SceneHotspotInfoPanel hotspot={activeInfoHotspot} onClose={() => setActiveInfoHotspot(null)} />
        )}
      </div>

      {project.settings.showThumbnails && orderedScenes.length > 1 && (
        <div className="border-t border-surface-800 bg-surface-900">
          <SceneThumbnails scenes={orderedScenes} activeSceneId={currentSceneId} onSelect={goToScene} />
        </div>
      )}

      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute inset-0 z-50 bg-surface-950 transition-opacity ease-in-out",
          fading ? "opacity-100" : "opacity-0"
        )}
        style={{ transitionDuration: `${SCENE_FADE_MS}ms` }}
      />
    </div>
  );
}

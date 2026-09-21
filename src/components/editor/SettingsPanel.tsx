import { useRef, useState } from "react";
import { Crosshair, Home, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { SceneTypeBadge } from "@/components/scenes/SceneTypeBadge";
import { useEditorStore } from "@/hooks/useEditorStore";
import { analyzeImage } from "@/utils/image";
import { saveImage, saveThumbnailFor } from "@/storage/imageStore";
import type { Scene } from "@/types";

interface SettingsPanelProps {
  scene: Scene | null;
  canCaptureInitialView?: boolean;
  onCaptureInitialView?: () => void;
}

export function SettingsPanel({ scene, canCaptureInitialView, onCaptureInitialView }: SettingsPanelProps) {
  const project = useEditorStore((s) => s.project);
  const renameProject = useEditorStore((s) => s.renameProject);
  const updateDescription = useEditorStore((s) => s.updateDescription);
  const updateProjectSettings = useEditorStore((s) => s.updateSettings);
  const updateScene = useEditorStore((s) => s.updateScene);
  const removeScene = useEditorStore((s) => s.removeScene);
  const setInitialScene = useEditorStore((s) => s.setInitialScene);
  const removeHotspot = useEditorStore((s) => s.removeHotspot);
  const selectHotspot = useEditorStore((s) => s.selectHotspot);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState(false);

  if (!project) return null;

  const handleReplaceImage = async (file: File) => {
    if (!scene) return;
    setReplacing(true);
    try {
      const analysis = await analyzeImage(file);
      const imageId = await saveImage(file);
      const thumbnailId = await saveThumbnailFor(imageId, file);
      updateScene(scene.id, {
        imageId,
        thumbnailId,
        type: analysis.suggestedType,
      });
    } finally {
      setReplacing(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {scene ? (
        <div className="space-y-5 p-4">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-surface-400">Escena</h3>
            <div className="space-y-3">
              <Input label="Nombre" value={scene.name} onChange={(e) => updateScene(scene.id, { name: e.target.value })} />

              <div className="flex items-center justify-between rounded-lg border border-surface-700 px-3 py-2">
                <SceneTypeBadge type={scene.type} />
                <label className="flex items-center gap-1.5 text-xs text-surface-400">
                  <input
                    type="checkbox"
                    checked={scene.type === "panorama"}
                    onChange={(e) => updateScene(scene.id, { type: e.target.checked ? "panorama" : "image" })}
                    className="accent-accent-500"
                  />
                  Es panorámica 360°
                </label>
              </div>

              <div>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={replacing}
                >
                  <RefreshCw size={14} /> {replacing ? "Reemplazando…" : "Cambiar fotografía"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReplaceImage(file);
                    e.target.value = "";
                  }}
                />
              </div>

              {canCaptureInitialView && onCaptureInitialView && (
                <Button variant="secondary" className="w-full justify-center" onClick={onCaptureInitialView}>
                  <Crosshair size={14} /> Usar vista actual como inicio
                </Button>
              )}

              {project.initialSceneId !== scene.id && (
                <Button variant="secondary" className="w-full justify-center" onClick={() => setInitialScene(scene.id)}>
                  <Home size={14} /> Establecer como escena inicial
                </Button>
              )}

              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={() => {
                  if (confirm(`¿Eliminar la escena "${scene.name}"?`)) removeScene(scene.id);
                }}
              >
                <Trash2 size={14} /> Eliminar escena
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-surface-400">
              Hotspots ({scene.hotspots.length})
            </h3>
            {scene.hotspots.length === 0 ? (
              <p className="text-sm text-surface-500">
                Pulsa "Agregar hotspot" sobre la fotografía y luego haz clic donde quieras colocar el punto de
                navegación o información.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {scene.hotspots.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => selectHotspot(h.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-surface-700 px-3 py-2 text-left text-sm hover:border-surface-500"
                    >
                      <span className="truncate text-surface-200">{h.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-surface-500">
                          {h.type === "navigation" ? "Navegación" : "Info"}
                        </span>
                        <Trash2
                          size={13}
                          className="text-surface-500 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHotspot(scene.id, h.id);
                          }}
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-400">Proyecto</h3>
          <Input label="Nombre" value={project.name} onChange={(e) => renameProject(e.target.value)} />
          <Textarea
            label="Descripción"
            rows={4}
            value={project.description}
            onChange={(e) => updateDescription(e.target.value)}
          />

          <div className="space-y-2 rounded-lg border border-surface-700 p-3">
            {(
              [
                ["autoRotate", "Auto-rotar panorámicas"],
                ["showThumbnails", "Mostrar miniaturas en el visor"],
                ["showRoomList", "Mostrar listado de habitaciones"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between text-sm text-surface-300">
                {label}
                <input
                  type="checkbox"
                  className="accent-accent-500"
                  checked={project.settings[key]}
                  onChange={(e) => updateProjectSettings({ [key]: e.target.checked })}
                />
              </label>
            ))}
          </div>

          <p className="text-sm text-surface-500">Selecciona una escena para editar sus hotspots.</p>
        </div>
      )}
    </div>
  );
}

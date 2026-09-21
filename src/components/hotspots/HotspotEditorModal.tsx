import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { createId } from "@/utils/id";
import type { Hotspot, HotspotType, ImagePosition, Panorama360Position, Scene } from "@/types";

type PendingPosition = { kind: "360"; position: Panorama360Position } | { kind: "image"; position: ImagePosition };

interface HotspotEditorModalProps {
  open: boolean;
  onClose: () => void;
  /** Escenas disponibles como destino (no incluye la escena actual). */
  availableScenes: Scene[];
  /** Presente al crear un hotspot nuevo. */
  pending?: PendingPosition | null;
  /** Presente al editar un hotspot existente. */
  editingHotspot?: Hotspot | null;
  onSave: (hotspot: Hotspot) => void;
  onDelete?: () => void;
}

export function HotspotEditorModal({
  open,
  onClose,
  availableScenes,
  pending,
  editingHotspot,
  onSave,
  onDelete,
}: HotspotEditorModalProps) {
  const [type, setType] = useState<HotspotType>("navigation");
  const [label, setLabel] = useState("");
  const [targetSceneId, setTargetSceneId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingHotspot) {
      setType(editingHotspot.type);
      setLabel(editingHotspot.label);
      if (editingHotspot.type === "navigation") setTargetSceneId(editingHotspot.targetSceneId);
      if (editingHotspot.type === "info") {
        setTitle(editingHotspot.title);
        setDescription(editingHotspot.description);
      }
    } else {
      setType("navigation");
      setLabel("");
      setTargetSceneId(availableScenes[0]?.id ?? "");
      setTitle("");
      setDescription("");
    }
  }, [open, editingHotspot, availableScenes]);

  const isEditing = !!editingHotspot;
  const positionSource = editingHotspot ?? pending;
  const canSave =
    type === "navigation" ? !!targetSceneId && label.trim().length > 0 : title.trim().length > 0;

  const handleSubmit = () => {
    if (!positionSource || !canSave) return;
    const id = editingHotspot?.id ?? createId("hotspot");
    const base = { id, kind: positionSource.kind, position: positionSource.position } as const;

    const hotspot: Hotspot =
      type === "navigation"
        ? ({ ...base, type: "navigation", label: label.trim(), targetSceneId } as Hotspot)
        : ({ ...base, type: "info", label: title.trim(), title: title.trim(), description: description.trim() } as Hotspot);

    onSave(hotspot);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar punto" : "Agregar punto"}
      footer={
        <>
          {isEditing && onDelete && (
            <Button
              variant="danger"
              className="mr-auto"
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSave}>
            {isEditing ? "Guardar cambios" : "Crear hotspot"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as HotspotType)}>
          <option value="navigation">Navegación</option>
          <option value="info">Información</option>
        </Select>

        {type === "navigation" ? (
          <>
            <Input
              label="Texto"
              placeholder="Ir a la cocina"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
            <Select
              label="Destino"
              value={targetSceneId}
              onChange={(e) => setTargetSceneId(e.target.value)}
              disabled={availableScenes.length === 0}
            >
              {availableScenes.length === 0 && <option value="">No hay otras escenas disponibles</option>}
              {availableScenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.name}
                </option>
              ))}
            </Select>
          </>
        ) : (
          <>
            <Input
              label="Título"
              placeholder="Cocina integral"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <Textarea
              label="Descripción"
              placeholder="Cocina equipada con..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

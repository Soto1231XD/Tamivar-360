import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { SceneUploadDropzone } from "./SceneUploadDropzone";
import { analyzeImage } from "@/utils/image";
import { saveImage, saveThumbnailFor } from "@/storage/imageStore";
import { createScene } from "@/constants/factories";
import { createId } from "@/utils/id";
import type { Scene, SceneType } from "@/types";

interface AddSceneModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (scenes: Scene[]) => void;
  nextOrder: number;
}

interface PendingItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  type: SceneType;
  analyzing: boolean;
}

export function AddSceneModal({ open, onClose, onCreated, nextOrder }: AddSceneModalProps) {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    for (const item of items) URL.revokeObjectURL(item.previewUrl);
    setItems([]);
  };

  const handleFiles = (files: File[]) => {
    const newItems: PendingItem[] = files.map((file) => ({
      id: createId("pending"),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name.replace(/\.[^.]+$/, ""),
      type: "image",
      analyzing: true,
    }));
    setItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      analyzeImage(item.file)
        .then((analysis) => {
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, type: analysis.suggestedType, analyzing: false } : it))
          );
        })
        .catch(() => {
          setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, analyzing: false } : it)));
        });
    }
  };

  const updateItem = (id: string, patch: Partial<PendingItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const stillAnalyzing = items.some((it) => it.analyzing);
  const canSubmit = items.length > 0 && items.every((it) => it.name.trim()) && !stillAnalyzing && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const scenes: Scene[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const imageId = await saveImage(item.file);
        const thumbnailId = await saveThumbnailFor(imageId, item.file);
        scenes.push(
          createScene({ name: item.name.trim(), type: item.type, imageId, thumbnailId, order: nextOrder + i })
        );
      }
      onCreated(scenes);
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const sceneCount = items.length;

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Agregar escenas"
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {saving
              ? "Guardando…"
              : sceneCount > 1
                ? `Agregar ${sceneCount} escenas`
                : "Agregar escena"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {items.length === 0 ? (
          <SceneUploadDropzone onFilesSelected={handleFiles} />
        ) : (
          <>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-surface-700 p-2">
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-14 w-20 shrink-0 rounded-md object-cover bg-surface-950"
                  />
                  <div className="flex-1 space-y-1.5">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      className="h-8 py-1"
                    />
                    <Select
                      value={item.type}
                      onChange={(e) => updateItem(item.id, { type: e.target.value as SceneType })}
                      className="h-8 py-1 text-xs"
                      disabled={item.analyzing}
                    >
                      <option value="panorama">Panorámica 360°</option>
                      <option value="image">Fotografía normal</option>
                    </Select>
                  </div>
                  {item.analyzing ? (
                    <Loader2 size={16} className="shrink-0 animate-spin text-surface-500" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Quitar fotografía"
                      className="shrink-0 rounded-md p-1.5 text-surface-500 hover:bg-surface-800 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <SceneUploadDropzone onFilesSelected={handleFiles} compact />
          </>
        )}
      </div>
    </Modal>
  );
}

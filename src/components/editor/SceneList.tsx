import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SceneListItem } from "./SceneListItem";
import { useEditorStore } from "@/hooks/useEditorStore";
import type { Scene } from "@/types";

interface SceneListProps {
  scenes: Scene[];
  onAddScene: () => void;
}

export function SceneList({ scenes, onAddScene }: SceneListProps) {
  const selectedSceneId = useEditorStore((s) => s.selectedSceneId);
  const project = useEditorStore((s) => s.project);
  const selectScene = useEditorStore((s) => s.selectScene);
  const renameSceneTo = useEditorStore((s) => s.updateScene);
  const duplicateScene = useEditorStore((s) => s.duplicateScene);
  const removeScene = useEditorStore((s) => s.removeScene);
  const setInitialScene = useEditorStore((s) => s.setInitialScene);
  const reorderScenes = useEditorStore((s) => s.reorderScenes);

  const [dragId, setDragId] = useState<string | null>(null);

  const ordered = [...scenes].sort((a, b) => a.order - b.order);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = ordered.map((s) => s.id);
    const fromIndex = ids.indexOf(dragId);
    const toIndex = ids.indexOf(targetId);
    ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, dragId);
    reorderScenes(ids);
    setDragId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-surface-400">Escenas</h2>
        <span className="text-xs text-surface-500">{scenes.length}</span>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2">
        {ordered.map((scene) => (
          <div
            key={scene.id}
            draggable
            onDragStart={() => setDragId(scene.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(scene.id)}
          >
            <SceneListItem
              scene={scene}
              active={scene.id === selectedSceneId}
              isInitial={scene.id === project?.initialSceneId}
              onSelect={() => selectScene(scene.id)}
              onRename={(name) => renameSceneTo(scene.id, { name })}
              onDuplicate={() => duplicateScene(scene.id)}
              onDelete={() => {
                if (confirm(`¿Eliminar la escena "${scene.name}"?`)) removeScene(scene.id);
              }}
              onSetInitial={() => setInitialScene(scene.id)}
              dragHandleProps={{}}
            />
          </div>
        ))}
      </div>

      <div className="p-2">
        <Button variant="secondary" className="w-full justify-center" onClick={onAddScene}>
          <Plus size={15} /> Escena
        </Button>
      </div>
    </div>
  );
}

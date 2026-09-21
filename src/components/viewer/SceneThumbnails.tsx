import clsx from "clsx";
import { useImageUrl } from "@/hooks/useImageUrl";
import type { Scene } from "@/types";

interface SceneThumbnailsProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelect: (sceneId: string) => void;
}

export function SceneThumbnails({ scenes, activeSceneId, onSelect }: SceneThumbnailsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-3 py-2.5">
      {scenes.map((scene) => (
        <SceneThumbnail
          key={scene.id}
          scene={scene}
          active={scene.id === activeSceneId}
          onSelect={() => onSelect(scene.id)}
        />
      ))}
    </div>
  );
}

function SceneThumbnail({ scene, active, onSelect }: { scene: Scene; active: boolean; onSelect: () => void }) {
  const url = useImageUrl(scene.thumbnailId || scene.imageId);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "flex shrink-0 flex-col overflow-hidden rounded-lg border-2 transition-colors",
        active ? "border-accent-400" : "border-transparent hover:border-surface-600"
      )}
      style={{ width: 84 }}
    >
      <span className="block h-12 w-full bg-surface-800">
        {url && <img src={url} alt={scene.name} className="h-full w-full object-cover" />}
      </span>
      <span className="truncate bg-surface-900 px-1.5 py-1 text-[11px] text-surface-200">{scene.name}</span>
    </button>
  );
}

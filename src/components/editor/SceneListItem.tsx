import { useEffect, useRef, useState } from "react";
import { Copy, GripVertical, Home, MoreVertical, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { SceneTypeBadge } from "@/components/scenes/SceneTypeBadge";
import { acquireImageUrl, releaseImageUrl } from "@/storage/imageStore";
import type { Scene } from "@/types";

interface SceneListItemProps {
  scene: Scene;
  active: boolean;
  isInitial: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetInitial: () => void;
  dragHandleProps: React.HTMLAttributes<HTMLButtonElement>;
}

export function SceneListItem({
  scene,
  active,
  isInitial,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onSetInitial,
  dragHandleProps,
}: SceneListItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(scene.name);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    const imageId = scene.thumbnailId || scene.imageId;
    if (!imageId) return;
    let cancelled = false;
    acquireImageUrl(imageId).then((url) => {
      if (!cancelled) setThumbUrl(url);
    });
    return () => {
      cancelled = true;
      releaseImageUrl(imageId);
    };
  }, [scene.thumbnailId, scene.imageId]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commitRename = () => {
    setEditing(false);
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== scene.name) onRename(trimmed);
    else setDraftName(scene.name);
  };

  return (
    <div
      className={clsx(
        "group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors cursor-pointer",
        active ? "bg-accent-500/10 ring-1 ring-accent-500/40" : "hover:bg-surface-800"
      )}
      onClick={onSelect}
    >
      <button
        type="button"
        className="cursor-grab text-surface-600 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Reordenar escena"
        onClick={(e) => e.stopPropagation()}
        {...dragHandleProps}
      >
        <GripVertical size={14} />
      </button>

      <span className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-surface-800">
        {thumbUrl && <img src={thumbUrl} alt="" className="h-full w-full object-cover" />}
      </span>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraftName(scene.name);
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border border-accent-400 bg-surface-900 px-1.5 py-0.5 text-sm text-surface-50 focus-visible:outline-none"
          />
        ) : (
          <p
            className="truncate text-sm font-medium text-surface-100"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          >
            {scene.name}
          </p>
        )}
        <div className="mt-0.5 flex items-center gap-1.5">
          <SceneTypeBadge type={scene.type} />
          {isInitial && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-accent-400">
              <Home size={10} /> Inicial
            </span>
          )}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Dropdown
          trigger={
            <button
              type="button"
              aria-label="Más opciones de la escena"
              className="flex h-7 w-7 items-center justify-center rounded-md text-surface-500 opacity-0 hover:bg-surface-700 hover:text-surface-100 group-hover:opacity-100"
            >
              <MoreVertical size={14} />
            </button>
          }
        >
          {(close) => (
            <>
              <DropdownItem
                onClick={() => {
                  setEditing(true);
                  close();
                }}
              >
                Renombrar
              </DropdownItem>
              {!isInitial && (
                <DropdownItem
                  onClick={() => {
                    onSetInitial();
                    close();
                  }}
                >
                  <Home size={14} /> Establecer como inicial
                </DropdownItem>
              )}
              <DropdownItem
                onClick={() => {
                  onDuplicate();
                  close();
                }}
              >
                <Copy size={14} /> Duplicar
              </DropdownItem>
              <DropdownItem
                danger
                onClick={() => {
                  onDelete();
                  close();
                }}
              >
                <Trash2 size={14} /> Eliminar
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </div>
  );
}

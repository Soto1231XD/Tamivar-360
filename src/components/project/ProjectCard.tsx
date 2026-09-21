import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Image as ImageIcon, MoreVertical, Trash2 } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { acquireImageUrl, releaseImageUrl } from "@/storage/imageStore";
import type { ProjectSummary } from "@/types";

interface ProjectCardProps {
  project: ProjectSummary;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function ProjectCard({ project, onDelete, onDuplicate }: ProjectCardProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!project.coverImageId) return;
    let cancelled = false;
    const imageId = project.coverImageId;
    acquireImageUrl(imageId).then((url) => {
      if (!cancelled) setCoverUrl(url);
    });
    return () => {
      cancelled = true;
      releaseImageUrl(imageId);
    };
  }, [project.coverImageId]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-surface-800 bg-surface-900 transition-colors hover:border-surface-600">
      <Link to={`/editor/${project.id}`} className="block">
        <div className="flex aspect-video items-center justify-center bg-surface-800">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={28} className="text-surface-600" />
          )}
        </div>
        <div className="p-4">
          <h3 className="truncate text-sm font-semibold text-surface-50">{project.name}</h3>
          <p className="mt-0.5 text-xs text-surface-500">
            {project.sceneCount} {project.sceneCount === 1 ? "escena" : "escenas"} · Actualizado{" "}
            {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </Link>

      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Dropdown
          trigger={
            <button
              type="button"
              aria-label="Más opciones"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-950/80 text-surface-200 hover:bg-surface-800"
            >
              <MoreVertical size={16} />
            </button>
          }
        >
          {(close) => (
            <>
              <DropdownItem
                onClick={() => {
                  onDuplicate(project.id);
                  close();
                }}
              >
                <Copy size={14} /> Duplicar
              </DropdownItem>
              <DropdownItem
                danger
                onClick={() => {
                  onDelete(project.id);
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

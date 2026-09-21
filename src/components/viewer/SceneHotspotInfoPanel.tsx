import { X } from "lucide-react";
import type { InfoHotspot } from "@/types";

interface SceneHotspotInfoPanelProps {
  hotspot: InfoHotspot;
  onClose: () => void;
}

export function SceneHotspotInfoPanel({ hotspot, onClose }: SceneHotspotInfoPanelProps) {
  return (
    <div className="absolute bottom-4 left-1/2 z-20 w-[min(360px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-surface-700 bg-surface-900/95 p-4 shadow-2xl backdrop-blur">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-surface-50">{hotspot.title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar información"
          className="rounded-md p-0.5 text-surface-400 hover:bg-surface-800 hover:text-surface-100"
        >
          <X size={15} />
        </button>
      </div>
      <p className="text-sm text-surface-300">{hotspot.description}</p>
    </div>
  );
}

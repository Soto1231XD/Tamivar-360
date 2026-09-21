import { Crosshair, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HotspotPlacementToolbarProps {
  armed: boolean;
  onArm: () => void;
  onCancel: () => void;
}

/**
 * Controla el modo de colocación de hotspots: por defecto el clic sobre la
 * foto no hace nada; el usuario debe pulsar "Agregar hotspot" para armar el
 * modo, y recién entonces el siguiente clic coloca el punto.
 */
export function HotspotPlacementToolbar({ armed, onArm, onCancel }: HotspotPlacementToolbarProps) {
  if (!armed) {
    return (
      <div className="pointer-events-auto absolute left-3 top-3 z-10">
        <Button variant="primary" size="sm" onClick={onArm}>
          <Plus size={15} /> Agregar hotspot
        </Button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-accent-500/40 bg-surface-900/95 px-3 py-2 text-sm text-surface-100 shadow-xl backdrop-blur">
      <Crosshair size={15} className="text-accent-400" />
      Haz clic sobre la fotografía para colocar el hotspot
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancelar colocación de hotspot"
        className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-surface-400 hover:bg-surface-800 hover:text-surface-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

import { type RefObject, useRef, useState } from "react";
import type { Hotspot, ImagePosition } from "@/types";

interface ImageSceneViewerProps {
  imageUrl: string;
  sceneName: string;
  hotspots: Hotspot[];
  placementMode?: boolean;
  onSceneClick?: (position: ImagePosition) => void;
  onHotspotClick?: (hotspotId: string) => void;
  /** Si se provee, los hotspots existentes se pueden arrastrar para reposicionarlos. */
  onHotspotDragEnd?: (hotspotId: string, position: ImagePosition) => void;
}

export function ImageSceneViewer({
  imageUrl,
  sceneName,
  hotspots,
  placementMode,
  onSceneClick,
  onHotspotClick,
  onHotspotDragEnd,
}: ImageSceneViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!placementMode || !containerRef.current) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-hotspot-marker]")) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onSceneClick?.({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-surface-950"
      onClick={handleClick}
      style={{ cursor: placementMode ? "crosshair" : "default" }}
    >
      <img src={imageUrl} alt={sceneName} className="max-h-full max-w-full object-contain select-none" draggable={false} />
      {hotspots
        .filter((h): h is Extract<Hotspot, { kind: "image" }> => h.kind === "image")
        .map((h) => (
          <ImageHotspotMarker
            key={h.id}
            hotspot={h}
            containerRef={containerRef}
            draggable={!!onHotspotDragEnd}
            onClick={() => onHotspotClick?.(h.id)}
            onDragEnd={(position) => onHotspotDragEnd?.(h.id, position)}
          />
        ))}
    </div>
  );
}

interface ImageHotspotMarkerProps {
  hotspot: Extract<Hotspot, { kind: "image" }>;
  containerRef: RefObject<HTMLDivElement | null>;
  draggable: boolean;
  onClick: () => void;
  onDragEnd: (position: ImagePosition) => void;
}

function ImageHotspotMarker({ hotspot, containerRef, draggable, onClick, onDragEnd }: ImageHotspotMarkerProps) {
  const [dragPosition, setDragPosition] = useState<ImagePosition | null>(null);
  const position = dragPosition ?? hotspot.position;

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    event.stopPropagation();
    event.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const target = event.currentTarget;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      /* noop */
    }

    let moved = false;
    const computePosition = (clientX: number, clientY: number): ImagePosition => {
      const rect = container.getBoundingClientRect();
      return {
        x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
        y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
      };
    };

    const handleMove = (moveEvent: PointerEvent) => {
      moved = true;
      setDragPosition(computePosition(moveEvent.clientX, moveEvent.clientY));
    };
    const handleUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      if (moved) {
        onDragEnd(computePosition(upEvent.clientX, upEvent.clientY));
        setDragPosition(null);
      } else {
        onClick();
      }
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
  };

  return (
    <button
      type="button"
      data-hotspot-marker
      className={`tour-hotspot tour-hotspot--absolute tour-hotspot--${hotspot.type} group`}
      style={{ left: `${position.x}%`, top: `${position.y}%`, cursor: draggable ? "grab" : undefined }}
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!draggable) onClick();
      }}
    >
      <span className="tour-hotspot__marker">{hotspot.type === "navigation" ? "↑" : "i"}</span>
      <span className="tour-hotspot__label">{hotspot.label}</span>
    </button>
  );
}

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { loadPannellum } from "@/utils/pannellumLoader";
import type { Hotspot, InitialView, Panorama360Position } from "@/types";

interface PanoramaViewerProps {
  imageUrl: string;
  hotspots: Hotspot[];
  initialView?: InitialView;
  autoRotate?: boolean;
  /** Habilita clic-para-colocar-hotspot; recibe pitch/yaw calculados por Pannellum. */
  placementMode?: boolean;
  onSceneClick?: (position: Panorama360Position) => void;
  onHotspotClick?: (hotspotId: string) => void;
  onViewChange?: (view: InitialView) => void;
  /** Si se provee, los hotspots existentes se pueden arrastrar para reposicionarlos. */
  onHotspotDragEnd?: (hotspotId: string, position: Panorama360Position) => void;
}

export function PanoramaViewer({
  imageUrl,
  hotspots,
  initialView,
  autoRotate,
  placementMode,
  onSceneClick,
  onHotspotClick,
  onViewChange,
  onHotspotDragEnd,
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewerInstance | null>(null);
  const activeHotspotIdsRef = useRef<string[]>([]);
  const callbacksRef = useRef({ onSceneClick, onHotspotClick, onViewChange, placementMode, onHotspotDragEnd });

  callbacksRef.current = { onSceneClick, onHotspotClick, onViewChange, placementMode, onHotspotDragEnd };

  const buildHotSpotConfig = (h: Extract<Hotspot, { kind: "360" }>): PannellumHotSpotConfig => ({
    id: h.id,
    pitch: h.position.pitch,
    yaw: h.position.yaw,
    type: "info",
    cssClass: `pnlm-hotspot-base tour-hotspot tour-hotspot--${h.type}`,
    createTooltipFunc: (div: HTMLElement) => {
      div.innerHTML = "";
      const btn = document.createElement("div");
      btn.className = "tour-hotspot__marker";
      btn.textContent = h.type === "navigation" ? "↑" : "i";
      const label = document.createElement("div");
      label.className = "tour-hotspot__label";
      label.textContent = h.label;
      div.appendChild(btn);
      div.appendChild(label);
      if (callbacksRef.current.onHotspotDragEnd) div.style.cursor = "grab";

      div.addEventListener("pointerdown", (ev: PointerEvent) => {
        if (!callbacksRef.current.onHotspotDragEnd) return;
        ev.stopPropagation();
        ev.preventDefault();
        const startX = ev.clientX;
        const startY = ev.clientY;
        let moved = false;
        try {
          div.setPointerCapture(ev.pointerId);
        } catch {
          /* noop */
        }
        div.style.cursor = "grabbing";
        // Pannellum posiciona el marcador con su propio transform
        // (translate + translateZ + rotate); hay que sumarle el arrastre,
        // no reemplazarlo, o el marcador salta al origen del contenedor.
        const baseTransform = div.style.transform;

        const handleMove = (moveEv: PointerEvent) => {
          const dx = moveEv.clientX - startX;
          const dy = moveEv.clientY - startY;
          if (!moved && Math.hypot(dx, dy) > 4) moved = true;
          if (moved) div.style.transform = `${baseTransform} translate(${dx}px, ${dy}px)`;
        };
        const handleUp = (upEv: PointerEvent) => {
          window.removeEventListener("pointermove", handleMove);
          window.removeEventListener("pointerup", handleUp);
          div.style.transform = baseTransform;
          div.style.cursor = "grab";
          if (moved) {
            const currentViewer = viewerRef.current;
            if (currentViewer) {
              const [pitch, yaw] = currentViewer.mouseEventToCoords(upEv);
              callbacksRef.current.onHotspotDragEnd?.(h.id, { pitch, yaw });
            }
          } else {
            callbacksRef.current.onHotspotClick?.(h.id);
          }
        };
        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp, { once: true });
      });

      // Sin capacidad de arrastre (p. ej. visor público): clic simple para abrir/editar.
      div.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (!callbacksRef.current.onHotspotDragEnd) callbacksRef.current.onHotspotClick?.(h.id);
      });
    },
  });

  useEffect(() => {
    let destroyed = false;
    let detachClick: (() => void) | undefined;
    const el = containerRef.current;
    if (!el) return;

    loadPannellum().then(() => {
      if (destroyed || !el) return;

      const viewer = window.pannellum.viewer(el, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        showControls: false,
        compass: false,
        autoRotate: autoRotate ? 2 : 0,
        pitch: initialView?.pitch ?? 0,
        yaw: initialView?.yaw ?? 0,
        hfov: initialView?.hfov ?? 100,
        hotSpots: hotspots
          .filter((h): h is Extract<Hotspot, { kind: "360" }> => h.kind === "360")
          .map(buildHotSpotConfig),
      });

      viewerRef.current = viewer;
      activeHotspotIdsRef.current = hotspots.filter((h) => h.kind === "360").map((h) => h.id);

      // Pannellum agrega la clase "pnlm-container" al propio elemento que le
      // pasamos (no crea un hijo con esa clase), así que el listener va en `el`.
      const handleClick = (event: MouseEvent) => {
        if (!callbacksRef.current.placementMode) return;
        const target = event.target as HTMLElement;
        if (target.closest(".tour-hotspot__marker") || target.closest(".pnlm-hotspot")) return;
        const [pitch, yaw] = viewer.mouseEventToCoords(event);
        callbacksRef.current.onSceneClick?.({ pitch, yaw });
      };
      el.addEventListener("click", handleClick);
      detachClick = () => el.removeEventListener("click", handleClick);

      const handleView = () => {
        callbacksRef.current.onViewChange?.({
          pitch: viewer.getPitch(),
          yaw: viewer.getYaw(),
          hfov: viewer.getHfov(),
        });
      };
      viewer.on("animatefinished", handleView);
    });

    return () => {
      destroyed = true;
      detachClick?.();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    for (const id of activeHotspotIdsRef.current) viewer.removeHotSpot(id);
    const next360 = hotspots.filter((h): h is Extract<Hotspot, { kind: "360" }> => h.kind === "360");
    for (const h of next360) viewer.addHotSpot(buildHotSpotConfig(h));
    activeHotspotIdsRef.current = next360.map((h) => h.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspots]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative h-full w-full [&_.pnlm-load-box]:bg-surface-900! [&_.pnlm-container]:bg-surface-950!",
        placementMode && "[&_.pnlm-container]:cursor-crosshair! [&_.pnlm-render-container]:cursor-crosshair!"
      )}
    />
  );
}

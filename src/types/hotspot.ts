/**
 * Posición de un hotspot dentro de una panorámica 360°.
 * pitch/yaw son grados devueltos directamente por Pannellum al hacer clic;
 * nunca se escriben manualmente en la UI.
 */
export interface Panorama360Position {
  pitch: number;
  yaw: number;
}

/**
 * Posición de un hotspot dentro de una fotografía normal, en porcentaje
 * (0-100) relativo al contenedor de la imagen. Esto mantiene el hotspot
 * alineado sin importar el tamaño de pantalla.
 */
export interface ImagePosition {
  x: number;
  y: number;
}

export type HotspotKind = "360" | "image";

interface HotspotCommon {
  id: string;
  label: string;
}

export interface NavigationHotspot extends HotspotCommon {
  type: "navigation";
  targetSceneId: string;
}

export interface InfoHotspot extends HotspotCommon {
  type: "info";
  title: string;
  description: string;
}

export type HotspotContent = NavigationHotspot | InfoHotspot;

export type Hotspot =
  | (NavigationHotspot & { kind: "360"; position: Panorama360Position })
  | (NavigationHotspot & { kind: "image"; position: ImagePosition })
  | (InfoHotspot & { kind: "360"; position: Panorama360Position })
  | (InfoHotspot & { kind: "image"; position: ImagePosition });

export type HotspotType = HotspotContent["type"];

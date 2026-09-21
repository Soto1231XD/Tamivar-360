import type { Hotspot } from "./hotspot";

export type SceneType = "panorama" | "image";

export interface InitialView {
  pitch: number;
  yaw: number;
  hfov: number;
}

export interface Scene {
  id: string;
  name: string;
  type: SceneType;
  /** Referencia al blob almacenado en el image store, no la imagen en sí. */
  imageId: string;
  thumbnailId: string;
  hotspots: Hotspot[];
  /** Sólo aplica a escenas tipo "panorama". */
  initialView?: InitialView;
  order: number;
}

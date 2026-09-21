declare module "pannellum/build/pannellum.js";
declare module "pannellum/build/pannellum.css";

interface PannellumHotSpotConfig {
  id?: string;
  pitch: number;
  yaw: number;
  type: "scene" | "info";
  text?: string;
  cssClass?: string;
  clickHandlerFunc?: () => void;
  createTooltipFunc?: (hotSpotDiv: HTMLElement, args: unknown) => void;
  createTooltipArgs?: unknown;
}

interface PannellumViewerConfig {
  type: "equirectangular";
  panorama: string;
  autoLoad?: boolean;
  showControls?: boolean;
  showZoomCtrl?: boolean;
  showFullscreenCtrl?: boolean;
  compass?: boolean;
  autoRotate?: number;
  pitch?: number;
  yaw?: number;
  hfov?: number;
  hotSpots?: PannellumHotSpotConfig[];
  hotSpotDebug?: boolean;
}

interface PannellumViewerInstance {
  destroy(): void;
  on(event: string, callback: (...args: unknown[]) => void): PannellumViewerInstance;
  off(event: string, callback?: (...args: unknown[]) => void): PannellumViewerInstance;
  getPitch(): number;
  getYaw(): number;
  getHfov(): number;
  mouseEventToCoords(event: MouseEvent): [number, number];
  addHotSpot(config: PannellumHotSpotConfig): void;
  removeHotSpot(id: string): boolean;
  lookAt(pitch: number, yaw: number, hfov?: number, animated?: boolean | number): void;
  resize(): void;
}

interface Window {
  pannellum: {
    viewer(container: HTMLElement | string, config: PannellumViewerConfig): PannellumViewerInstance;
  };
}

let loadPromise: Promise<void> | null = null;

/** Carga pannellum.js/css bajo demanda (sólo cuando existe una escena 360°). */
export function loadPannellum(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all([
      import("pannellum/build/pannellum.css"),
      import("pannellum/build/pannellum.js"),
    ]).then(() => undefined);
  }
  return loadPromise;
}

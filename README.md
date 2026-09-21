# Tamivar 360

Editor de recorridos virtuales 360° para propiedades inmobiliarias. Permite crear, editar, previsualizar y exportar recorridos que combinan fotografías panorámicas (dron) con fotografías normales (interiores), sin escribir código.

## Requisitos

- Node.js 18+

## Uso

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

```bash
npm run build    # build de producción en dist/
npm run preview  # sirve el build de producción localmente
```

## Cómo funciona

- **Local-first**: todo se guarda en el navegador con IndexedDB (proyectos + imágenes como Blob). No requiere backend ni conexión a internet.
- **Editor** (`/editor/:id`): crear escenas, subir fotos 360°/normales, colocar hotspots con clic, conectar escenas, ajustes del proyecto.
- **Preview** (`/preview/:id`): recorrido tal como lo verá el cliente, sin herramientas de edición.
- **Viewer público** (`/viewer/:id`): misma vista que Preview; es la ruta pensada para compartir por URL o insertar en un `<iframe>`.
- **Exportar**: desde el editor, botón "Exportar" genera:
  - HTML autónomo (un solo archivo, imágenes en Base64).
  - ZIP de producción (`index.html` + `assets/css/js` como archivos reales, recomendado para recorridos grandes).
  - Respaldo `.tour` del proyecto editable (para mover/backup entre computadoras, reimportable desde "Proyectos").

## Arquitectura

```
src/
├── components/   # editor, viewer, hotspots, scenes, project, export, layout, ui
├── pages/        # Home, Projects, ProjectEditor, Preview, Viewer
├── hooks/        # useEditorStore (zustand), useAutosave, useImageUrl, useLoadedProject
├── services/
│   ├── repositories/  # ProjectRepository (interfaz) + LocalProjectRepository (Dexie)
│   ├── export/         # generadores HTML/ZIP/.tour + runtime vanilla JS del recorrido exportado
│   └── validation/      # validación del recorrido antes de exportar
├── storage/      # Dexie (db.ts) + imageStore.ts (blobs + Object URL cache)
├── types/        # Project, Scene, Hotspot, Validation
└── utils/        # detección 360°, thumbnails, slugs, ids
```

El visor (`components/viewer`, `pages/Preview`, `pages/Viewer`) no depende del editor ni de IndexedDB directamente: sólo consume un objeto `Project` ya resuelto. El mismo motor de reproducción está reimplementado en JS vanilla (`services/export/runtime/tour-runtime.js`) para los recorridos exportados, que no dependen de React.

Para agregar un backend en el futuro (NestJS + MySQL + auth), sólo hace falta implementar `ApiProjectRepository` (misma interfaz que `LocalProjectRepository`, en `services/repositories/`) y cambiar la selección en `services/repositories/index.ts`.

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Zustand, Dexie (IndexedDB), Pannellum (panorámicas 360°), JSZip, file-saver, Lucide.

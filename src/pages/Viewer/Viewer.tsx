import { useParams } from "react-router-dom";
import { TourPlayer } from "@/components/viewer/TourPlayer";
import { useLoadedProject } from "@/hooks/useLoadedProject";

/**
 * Visor público standalone. Es la ruta que se usa para compartir una URL
 * o insertar el recorrido mediante <iframe>. No depende del editor.
 */
export function Viewer() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, loading, notFound } = useLoadedProject(projectId);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-surface-950 text-surface-400">Cargando recorrido…</div>;
  }
  if (notFound || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950 text-surface-400">
        Recorrido no encontrado.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <TourPlayer project={project} />
    </div>
  );
}

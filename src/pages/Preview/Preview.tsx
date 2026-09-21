import { useNavigate, useParams } from "react-router-dom";
import { TourPlayer } from "@/components/viewer/TourPlayer";
import { useLoadedProject } from "@/hooks/useLoadedProject";

export function Preview() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project, loading, notFound } = useLoadedProject(projectId);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-surface-950 text-surface-400">Cargando recorrido…</div>;
  }
  if (notFound || !project) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950 text-surface-400">
        Proyecto no encontrado.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <TourPlayer project={project} onExit={() => navigate(`/editor/${project.id}`)} />
    </div>
  );
}
